using FoodDiary.Api.DTOs.Responses;
using Microsoft.AspNetCore.Http;

namespace FoodDiary.Api.Interfaces;

public interface IPhotoService
{
    Task<PhotoUploadResponse> UploadAsync(Guid userId, IFormFile photo, string baseUrl);
    Task DeleteAsync(string? photoUrl);
}
