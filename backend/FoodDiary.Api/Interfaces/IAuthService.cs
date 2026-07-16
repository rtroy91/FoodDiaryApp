using FoodDiary.Api.DTOs.Requests;
using FoodDiary.Api.DTOs.Responses;

namespace FoodDiary.Api.Interfaces;

public interface IAuthService
{
    Task<AuthSessionResult> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken);
    Task<AuthSessionResult> LoginAsync(LoginRequest request, CancellationToken cancellationToken);
    string BuildGoogleAuthorizationUrl(bool rememberMe);
    Task<GoogleRedirectAuthResult> CompleteGoogleRedirectLoginAsync(
        string code,
        string state,
        CancellationToken cancellationToken);
    Task<AuthResponse?> GetCurrentUserAsync(Guid userId, CancellationToken cancellationToken);
    Task RequestPasswordResetAsync(ForgotPasswordRequest request, CancellationToken cancellationToken);
    Task ResetPasswordAsync(ResetPasswordRequest request, CancellationToken cancellationToken);
}
