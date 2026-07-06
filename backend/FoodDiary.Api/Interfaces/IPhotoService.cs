using FoodDiary.Api.DTOs.Requests;
using FoodDiary.Api.DTOs.Responses;

namespace FoodDiary.Api.Interfaces;

public interface IPhotoService
{
    Task<UploadUrlResponse> GenerateUploadUrlAsync(Guid userId, UploadUrlRequest request);
}
