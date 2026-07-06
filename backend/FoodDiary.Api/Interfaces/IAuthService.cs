using FoodDiary.Api.DTOs.Requests;
using FoodDiary.Api.DTOs.Responses;

namespace FoodDiary.Api.Interfaces;

public interface IAuthService
{
    Task<AuthResponse> RegisterAsync(RegisterRequest request);
    Task<AuthResponse> LoginAsync(LoginRequest request);
}
