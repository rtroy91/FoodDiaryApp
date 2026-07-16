using System.IdentityModel.Tokens.Jwt;
using System.Security.Cryptography;
using System.Security.Claims;
using System.Text;
using FoodDiary.Api.Data;
using FoodDiary.Api.DTOs.Requests;
using FoodDiary.Api.DTOs.Responses;
using FoodDiary.Api.Interfaces;
using FoodDiary.Api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace FoodDiary.Api.Services;

public class AuthService : IAuthService
{
    private const int DisplayNameMaxLength = 15;
    private static readonly TimeSpan PasswordResetTokenLifetime = TimeSpan.FromMinutes(30);
    private readonly FoodDiaryContext _context;
    private readonly IConfiguration _config;
    private readonly IEmailService _emailService;

    public AuthService(FoodDiaryContext context, IConfiguration config, IEmailService emailService)
    {
        _context = context;
        _config = config;
        _emailService = emailService;
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken)
    {
        var email = NormalizeEmail(request.Email);
        var displayName = NormalizeDisplayName(request.DisplayName);

        if (displayName?.Length > DisplayNameMaxLength)
            throw new InvalidOperationException("Display name must be 15 characters or fewer.");

        if (await _context.Users.AnyAsync(u => u.Email == email, cancellationToken))
            throw new InvalidOperationException("Email already registered.");

        var user = new User
        {
            Email = email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            DisplayName = displayName,
            Role = GetRoleForEmail(email)
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync(cancellationToken);

        return BuildAuthResponse(user);
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken cancellationToken)
    {
        var email = NormalizeEmail(request.Email);
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == email, cancellationToken)
            ?? throw new UnauthorizedAccessException("Invalid email or password.");

        if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            throw new UnauthorizedAccessException("Invalid email or password.");

        var configuredRole = GetRoleForEmail(user.Email);
        if (user.Role != configuredRole && configuredRole == "Admin")
        {
            user.Role = configuredRole;
            await _context.SaveChangesAsync(cancellationToken);
        }

        return BuildAuthResponse(user);
    }

    public async Task<AuthResponse?> GetCurrentUserAsync(Guid userId, CancellationToken cancellationToken)
    {
        var user = await _context.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);

        return user is null ? null : BuildAuthResponse(user, includeToken: false);
    }

    public async Task RequestPasswordResetAsync(ForgotPasswordRequest request, CancellationToken cancellationToken)
    {
        if (!_emailService.IsConfigured)
        {
            throw new InvalidOperationException("Password reset email is not configured.");
        }

        var email = NormalizeEmail(request.Email);
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email, cancellationToken);

        if (user is null)
        {
            return;
        }

        var token = GenerateSecureToken();
        var tokenHash = HashToken(token);

        _context.PasswordResetTokens.Add(new PasswordResetToken
        {
            UserId = user.Id,
            TokenHash = tokenHash,
            ExpiresAt = DateTime.UtcNow.Add(PasswordResetTokenLifetime)
        });

        await _context.SaveChangesAsync(cancellationToken);

        var resetUrl = BuildPasswordResetUrl(token);
        await _emailService.SendPasswordResetEmailAsync(user.Email, resetUrl, cancellationToken);
    }

    public async Task ResetPasswordAsync(ResetPasswordRequest request, CancellationToken cancellationToken)
    {
        var tokenHash = HashToken(request.Token);
        var resetToken = await _context.PasswordResetTokens
            .Include(t => t.User)
            .FirstOrDefaultAsync(t => t.TokenHash == tokenHash, cancellationToken)
            ?? throw new InvalidOperationException("This reset link is invalid or expired.");

        if (resetToken.UsedAt is not null || resetToken.ExpiresAt < DateTime.UtcNow || resetToken.User is null)
        {
            throw new InvalidOperationException("This reset link is invalid or expired.");
        }

        resetToken.User.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        resetToken.UsedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);
    }

    // ── Private helpers ────────────────────────────────────────────────────

    private AuthResponse BuildAuthResponse(User user, bool includeToken = true) => new()
    {
        Token = includeToken ? GenerateJwt(user) : string.Empty,
        UserId = user.Id,
        Email = user.Email,
        DisplayName = user.DisplayName,
        Role = user.Role
    };

    private string GenerateJwt(User user)
    {
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role)
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddDays(30),
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private string GetRoleForEmail(string email)
    {
        var adminEmail = _config["Admin:InitialEmail"] ?? _config["INITIAL_ADMIN_EMAIL"];
        return !string.IsNullOrWhiteSpace(adminEmail) &&
               string.Equals(email.Trim(), adminEmail.Trim(), StringComparison.OrdinalIgnoreCase)
            ? "Admin"
            : "User";
    }

    private static string NormalizeEmail(string email) => email.Trim().ToLowerInvariant();

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
        var frontendBaseUrl = _config["Frontend:BaseUrl"] ?? _config["FRONTEND_BASE_URL"] ?? "http://localhost:5173";
        return $"{frontendBaseUrl.TrimEnd('/')}/reset-password?token={Uri.EscapeDataString(token)}";
    }

    private static string? NormalizeDisplayName(string? displayName)
    {
        var normalized = displayName?.Trim();
        return string.IsNullOrEmpty(normalized) ? null : normalized;
    }
}
