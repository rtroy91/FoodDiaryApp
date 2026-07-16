namespace FoodDiary.Api.DTOs.Responses;

public class AuthResponse
{
    public string Email { get; set; } = string.Empty;
    public string? DisplayName { get; set; }
    public string Role { get; set; } = "User";
}

public sealed record AuthSessionResult(AuthResponse User, string Token);

public sealed record GoogleRedirectAuthResult(AuthSessionResult Auth, bool RememberMe, string ReturnPath);
