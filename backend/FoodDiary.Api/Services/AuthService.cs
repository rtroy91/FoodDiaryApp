using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using FoodDiary.Api.Data;
using FoodDiary.Api.DTOs.Requests;
using FoodDiary.Api.DTOs.Responses;
using FoodDiary.Api.Interfaces;
using FoodDiary.Api.Models;
using Google.Apis.Auth;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.EntityFrameworkCore;

namespace FoodDiary.Api.Services;

public class AuthService(
    FoodDiaryContext context,
    IConfiguration config,
    IEmailService emailService,
    IHttpClientFactory httpClientFactory,
    IJwtTokenService jwtTokenService,
    IDataProtectionProvider dataProtectionProvider) : IAuthService
{
    private const int DisplayNameMaxLength = 15;
    private const string GoogleAuthorizationEndpoint = "https://accounts.google.com/o/oauth2/v2/auth";
    private const string GoogleTokenEndpoint = "https://oauth2.googleapis.com/token";
    private const string GoogleClientIdConfigKey = "GoogleAuth:ClientId";
    private const string GoogleClientIdEnvKey = "GOOGLE_CLIENT_ID";
    private const string GoogleClientSecretConfigKey = "GoogleAuth:ClientSecret";
    private const string GoogleClientSecretEnvKey = "GOOGLE_CLIENT_SECRET";
    private const string GoogleRedirectUriConfigKey = "GoogleAuth:RedirectUri";
    private const string GoogleRedirectUriEnvKey = "GOOGLE_REDIRECT_URI";
    private static readonly TimeSpan PasswordResetTokenLifetime = TimeSpan.FromMinutes(30);
    private static readonly TimeSpan GoogleStateLifetime = TimeSpan.FromMinutes(10);
    private readonly IDataProtector googleStateProtector =
        dataProtectionProvider.CreateProtector("FoodDiary.GoogleOAuth.State.v1");

    public async Task<AuthSessionResult> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken)
    {
        var email = NormalizeEmail(request.Email);
        var displayName = NormalizeDisplayName(request.DisplayName);

        if (displayName?.Length > DisplayNameMaxLength)
            throw new InvalidOperationException("Display name must be 15 characters or fewer.");

        if (await context.Users.AnyAsync(u => u.Email == email, cancellationToken))
            throw new InvalidOperationException("Email already registered.");

        var user = new User
        {
            Email = email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            DisplayName = displayName,
            Role = GetRoleForEmail(email)
        };

        context.Users.Add(user);
        await context.SaveChangesAsync(cancellationToken);

        return BuildAuthSession(user);
    }

    public async Task<AuthSessionResult> LoginAsync(LoginRequest request, CancellationToken cancellationToken)
    {
        var email = NormalizeEmail(request.Email);
        var user = await context.Users
            .FirstOrDefaultAsync(u => u.Email == email, cancellationToken)
            ?? throw new UnauthorizedAccessException("Invalid email or password.");

        if (string.IsNullOrWhiteSpace(user.PasswordHash) || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            throw new UnauthorizedAccessException("Invalid email or password.");

        await ApplyConfiguredRoleAsync(user, cancellationToken);

        return BuildAuthSession(user);
    }

    public string BuildGoogleAuthorizationUrl(bool rememberMe)
    {
        var clientId = GetRequiredGoogleClientId();
        var redirectUri = GetRequiredGoogleRedirectUri();
        var state = ProtectGoogleState(new GoogleAuthState(rememberMe, "/", DateTimeOffset.UtcNow.Add(GoogleStateLifetime)));

        return QueryHelpers.AddQueryString(
            GoogleAuthorizationEndpoint,
            new Dictionary<string, string?>
            {
                ["response_type"] = "code",
                ["client_id"] = clientId,
                ["redirect_uri"] = redirectUri,
                ["scope"] = "openid email profile",
                ["state"] = state,
                ["prompt"] = "select_account"
            });
    }

    public async Task<GoogleRedirectAuthResult> CompleteGoogleRedirectLoginAsync(
        string code,
        string state,
        CancellationToken cancellationToken)
    {
        var authState = UnprotectGoogleState(state);
        var idToken = await ExchangeGoogleCodeForIdTokenAsync(code, cancellationToken);
        var payload = await ValidateGoogleCredentialAsync(idToken);
        var user = await GetOrCreateGoogleUserAsync(payload, cancellationToken);

        return new GoogleRedirectAuthResult(BuildAuthSession(user), authState.RememberMe, authState.ReturnPath);
    }

    private async Task<User> GetOrCreateGoogleUserAsync(
        GoogleJsonWebSignature.Payload payload,
        CancellationToken cancellationToken)
    {
        var email = NormalizeEmail(payload.Email ?? string.Empty);

        if (string.IsNullOrWhiteSpace(email) || payload.EmailVerified != true)
        {
            throw new UnauthorizedAccessException("Google account email could not be verified.");
        }

        var user = await context.Users
            .FirstOrDefaultAsync(u => u.GoogleSubject == payload.Subject, cancellationToken);

        if (user is not null)
        {
            await ApplyConfiguredRoleAsync(user, cancellationToken);
            return user;
        }

        var existingEmailUser = await context.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Email == email, cancellationToken);

        if (existingEmailUser is not null)
        {
            throw new UnauthorizedAccessException("Sign in with your password before linking Google to this account.");
        }

        user = new User
        {
            Email = email,
            GoogleSubject = payload.Subject,
            PasswordHash = string.Empty,
            DisplayName = BuildGoogleDisplayName(payload),
            Role = GetRoleForEmail(email)
        };

        context.Users.Add(user);

        await context.SaveChangesAsync(cancellationToken);
        return user;
    }

    public async Task<AuthResponse?> GetCurrentUserAsync(Guid userId, CancellationToken cancellationToken)
    {
        var user = await context.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);

        return user is null ? null : BuildAuthResponse(user);
    }

    public async Task RequestPasswordResetAsync(ForgotPasswordRequest request, CancellationToken cancellationToken)
    {
        if (!emailService.IsConfigured)
        {
            throw new InvalidOperationException("Password reset email is not configured.");
        }

        var email = NormalizeEmail(request.Email);
        var user = await context.Users.FirstOrDefaultAsync(u => u.Email == email, cancellationToken);

        if (user is null)
        {
            return;
        }

        var token = GenerateSecureToken();
        var tokenHash = HashToken(token);

        context.PasswordResetTokens.Add(new PasswordResetToken
        {
            UserId = user.Id,
            TokenHash = tokenHash,
            ExpiresAt = DateTime.UtcNow.Add(PasswordResetTokenLifetime)
        });

        await context.SaveChangesAsync(cancellationToken);

        var resetUrl = BuildPasswordResetUrl(token);
        await emailService.SendPasswordResetEmailAsync(user.Email, resetUrl, cancellationToken);
    }

    public async Task ResetPasswordAsync(ResetPasswordRequest request, CancellationToken cancellationToken)
    {
        var tokenHash = HashToken(request.Token);
        var resetToken = await context.PasswordResetTokens
            .Include(t => t.User)
            .FirstOrDefaultAsync(t => t.TokenHash == tokenHash, cancellationToken)
            ?? throw new InvalidOperationException("This reset link is invalid or expired.");

        if (resetToken.UsedAt is not null || resetToken.ExpiresAt < DateTime.UtcNow || resetToken.User is null)
        {
            throw new InvalidOperationException("This reset link is invalid or expired.");
        }

        resetToken.User.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        resetToken.UsedAt = DateTime.UtcNow;

        await context.SaveChangesAsync(cancellationToken);
    }

    // Private helpers

    private AuthSessionResult BuildAuthSession(User user) => new(BuildAuthResponse(user), jwtTokenService.Generate(user));

    private static AuthResponse BuildAuthResponse(User user) => new()
    {
        Email = user.Email,
        DisplayName = user.DisplayName,
        Role = user.Role
    };

    private string GetRoleForEmail(string email)
    {
        var adminEmail = config["Admin:InitialEmail"] ?? config["INITIAL_ADMIN_EMAIL"];
        return !string.IsNullOrWhiteSpace(adminEmail) &&
               string.Equals(email.Trim(), adminEmail.Trim(), StringComparison.OrdinalIgnoreCase)
            ? "Admin"
            : "User";
    }

    private static string NormalizeEmail(string email) => email.Trim().ToLowerInvariant();

    private async Task ApplyConfiguredRoleAsync(User user, CancellationToken cancellationToken)
    {
        var configuredRole = GetRoleForEmail(user.Email);
        if (user.Role != configuredRole && configuredRole == "Admin")
        {
            user.Role = configuredRole;
            await context.SaveChangesAsync(cancellationToken);
        }
    }

    private async Task<GoogleJsonWebSignature.Payload> ValidateGoogleCredentialAsync(string credential)
    {
        if (string.IsNullOrWhiteSpace(credential))
        {
            throw new UnauthorizedAccessException("Google credential is required.");
        }

        var clientId = GetRequiredGoogleClientId();

        try
        {
            return await GoogleJsonWebSignature.ValidateAsync(
                credential,
                new GoogleJsonWebSignature.ValidationSettings
                {
                    Audience = new[] { clientId }
                });
        }
        catch (InvalidJwtException ex)
        {
            throw new UnauthorizedAccessException("Google credential is invalid.", ex);
        }
    }

    private async Task<string> ExchangeGoogleCodeForIdTokenAsync(string code, CancellationToken cancellationToken)
    {
        var client = httpClientFactory.CreateClient();
        using var response = await client.PostAsync(
            GoogleTokenEndpoint,
            new FormUrlEncodedContent(new Dictionary<string, string>
            {
                ["code"] = code,
                ["client_id"] = GetRequiredGoogleClientId(),
                ["client_secret"] = GetRequiredGoogleClientSecret(),
                ["redirect_uri"] = GetRequiredGoogleRedirectUri(),
                ["grant_type"] = "authorization_code"
            }),
            cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            throw new UnauthorizedAccessException("Google authorization code could not be exchanged.");
        }

        var payload = await response.Content.ReadAsStringAsync(cancellationToken);
        var tokenResponse = JsonSerializer.Deserialize<GoogleTokenResponse>(payload);

        if (string.IsNullOrWhiteSpace(tokenResponse?.IdToken))
        {
            throw new UnauthorizedAccessException("Google did not return an ID token.");
        }

        return tokenResponse.IdToken;
    }

    private string ProtectGoogleState(GoogleAuthState state)
    {
        var json = JsonSerializer.Serialize(state);
        return googleStateProtector.Protect(json);
    }

    private GoogleAuthState UnprotectGoogleState(string protectedState)
    {
        try
        {
            var json = googleStateProtector.Unprotect(protectedState);
            var state = JsonSerializer.Deserialize<GoogleAuthState>(json)
                ?? throw new UnauthorizedAccessException("Google sign-in state is invalid.");

            if (state.ExpiresAt < DateTimeOffset.UtcNow || !state.ReturnPath.StartsWith("/", StringComparison.Ordinal))
            {
                throw new UnauthorizedAccessException("Google sign-in state is invalid or expired.");
            }

            return state;
        }
        catch (Exception ex) when (ex is not UnauthorizedAccessException)
        {
            throw new UnauthorizedAccessException("Google sign-in state is invalid.", ex);
        }
    }

    private string GetRequiredGoogleClientId()
    {
        var clientId = config[GoogleClientIdConfigKey] ?? config[GoogleClientIdEnvKey];
        if (string.IsNullOrWhiteSpace(clientId))
        {
            throw new InvalidOperationException("Google sign-in is not configured.");
        }

        return clientId;
    }

    private string GetRequiredGoogleClientSecret()
    {
        var clientSecret = config[GoogleClientSecretConfigKey] ?? config[GoogleClientSecretEnvKey];
        if (string.IsNullOrWhiteSpace(clientSecret))
        {
            throw new InvalidOperationException("Google sign-in client secret is not configured.");
        }

        return clientSecret;
    }

    private string GetRequiredGoogleRedirectUri()
    {
        var redirectUri = config[GoogleRedirectUriConfigKey] ?? config[GoogleRedirectUriEnvKey];
        if (string.IsNullOrWhiteSpace(redirectUri))
        {
            throw new InvalidOperationException("Google sign-in redirect URI is not configured.");
        }

        return redirectUri;
    }

    private static string? BuildGoogleDisplayName(GoogleJsonWebSignature.Payload payload)
    {
        var name = NormalizeDisplayName(payload.Name);
        if (!string.IsNullOrWhiteSpace(name))
        {
            return name.Length > DisplayNameMaxLength ? name[..DisplayNameMaxLength] : name;
        }

        var emailName = payload.Email?.Split('@')[0];
        var normalizedEmailName = NormalizeDisplayName(emailName);
        return normalizedEmailName?.Length > DisplayNameMaxLength
            ? normalizedEmailName[..DisplayNameMaxLength]
            : normalizedEmailName;
    }

    private static string GenerateSecureToken()
    {
        var bytes = RandomNumberGenerator.GetBytes(32);
        return Convert.ToBase64String(bytes)
            .Replace("+", "-", StringComparison.Ordinal)
            .Replace("/", "_", StringComparison.Ordinal)
            .TrimEnd('=');
    }

    private static string HashToken(string token)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(token));
        return Convert.ToHexString(bytes);
    }

    private string BuildPasswordResetUrl(string token)
    {
        var frontendBaseUrl = config["Frontend:BaseUrl"] ?? config["FRONTEND_BASE_URL"] ?? "http://localhost:5173";
        return $"{frontendBaseUrl.TrimEnd('/')}/reset-password?token={Uri.EscapeDataString(token)}";
    }

    private static string? NormalizeDisplayName(string? displayName)
    {
        var normalized = displayName?.Trim();
        return string.IsNullOrEmpty(normalized) ? null : normalized;
    }

    private sealed record GoogleAuthState(bool RememberMe, string ReturnPath, DateTimeOffset ExpiresAt);

    private sealed record GoogleTokenResponse(
        [property: JsonPropertyName("id_token")] string? IdToken);
}
