using FoodDiary.Api.DTOs.Requests;
using FoodDiary.Api.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace FoodDiary.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(
    IAuthService authService,
    IConfiguration config,
    IHostEnvironment environment,
    ILogger<AuthController> logger) : ControllerBase
{
    private const string AuthCookieName = "food_diary_auth";

    /// <summary>Register a new account.</summary>
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request, CancellationToken cancellationToken)
    {
        var response = await authService.RegisterAsync(request, cancellationToken);
        return Ok(response.User);
    }

    /// <summary>Log in and receive a JWT.</summary>
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request, CancellationToken cancellationToken)
    {
        var response = await authService.LoginAsync(request, cancellationToken);
        SetAuthCookie(response.Token, request.RememberMe);
        return Ok(response.User);
    }

    [HttpGet("google/login")]
    public IActionResult GoogleRedirectLogin([FromQuery] bool rememberMe = false)
    {
        return Redirect(authService.BuildGoogleAuthorizationUrl(rememberMe));
    }

    [HttpGet("google/callback")]
    public async Task<IActionResult> GoogleRedirectCallback(
        [FromQuery] string? code,
        [FromQuery] string? state,
        [FromQuery] string? error,
        CancellationToken cancellationToken)
    {
        if (!string.IsNullOrWhiteSpace(error) || string.IsNullOrWhiteSpace(code) || string.IsNullOrWhiteSpace(state))
        {
            return Redirect(BuildFrontendRedirect("/login?googleError=1"));
        }

        try
        {
            var result = await authService.CompleteGoogleRedirectLoginAsync(code, state, cancellationToken);
            SetAuthCookie(result.Auth.Token, result.RememberMe);
            return Redirect(BuildFrontendRedirect(result.ReturnPath));
        }
        catch (Exception ex) when (ex is UnauthorizedAccessException or InvalidOperationException)
        {
            logger.LogWarning(ex, "Google sign-in failed during callback.");
            return Redirect(BuildFrontendRedirect("/login?googleError=1"));
        }
    }

    [HttpPost("logout")]
    public IActionResult Logout()
    {
        Response.Cookies.Delete(AuthCookieName, BuildAuthCookieOptions());
        return NoContent();
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword(
        [FromBody] ForgotPasswordRequest request,
        CancellationToken cancellationToken)
    {
        await authService.RequestPasswordResetAsync(request, cancellationToken);
        return Ok(new { message = "If this email exists, we sent a reset link." });
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword(
        [FromBody] ResetPasswordRequest request,
        CancellationToken cancellationToken)
    {
        await authService.ResetPasswordAsync(request, cancellationToken);
        Response.Cookies.Delete(AuthCookieName, BuildAuthCookieOptions());
        return NoContent();
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> Me(CancellationToken cancellationToken)
    {
        var userIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdValue, out var userId))
        {
            return Unauthorized();
        }

        var response = await authService.GetCurrentUserAsync(userId, cancellationToken);
        return response is null ? Unauthorized() : Ok(response);
    }

    private void SetAuthCookie(string token, bool rememberMe = true)
    {
        Response.Cookies.Append(AuthCookieName, token, BuildAuthCookieOptions(rememberMe));
    }

    private CookieOptions BuildAuthCookieOptions(bool rememberMe = true)
    {
        var options = new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = GetConfiguredSameSiteMode(),
            Path = "/"
        };

        if (rememberMe)
        {
            options.Expires = DateTimeOffset.UtcNow.AddDays(30);
        }

        return options;
    }

    private SameSiteMode GetConfiguredSameSiteMode()
    {
        var configuredValue = config["AuthCookie:SameSite"] ?? config["AUTH_COOKIE_SAME_SITE"];
        if (Enum.TryParse<SameSiteMode>(configuredValue, ignoreCase: true, out var configuredMode))
        {
            return configuredMode;
        }

        return environment.IsDevelopment() ? SameSiteMode.None : SameSiteMode.Lax;
    }

    private string BuildFrontendRedirect(string path)
    {
        var frontendBaseUrl = config["Frontend:BaseUrl"] ?? config["FRONTEND_BASE_URL"] ?? "http://localhost:5173";
        var safePath = path.StartsWith("/", StringComparison.Ordinal) ? path : "/";
        return $"{frontendBaseUrl.TrimEnd('/')}{safePath}";
    }
}
