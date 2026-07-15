using System.IdentityModel.Tokens.Jwt;
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
    private readonly FoodDiaryContext _context;
    private readonly IConfiguration _config;

    public AuthService(FoodDiaryContext context, IConfiguration config)
    {
        _context = context;
        _config = config;
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

    // ── Private helpers ────────────────────────────────────────────────────

    private AuthResponse BuildAuthResponse(User user) => new()
    {
        Token = GenerateJwt(user),
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

    private static string? NormalizeDisplayName(string? displayName)
    {
        var normalized = displayName?.Trim();
        return string.IsNullOrEmpty(normalized) ? null : normalized;
    }
}
