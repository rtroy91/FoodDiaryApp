using System.Security.Claims;
using FoodDiary.Api.DTOs.Requests;
using FoodDiary.Api.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FoodDiary.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/photos")]
public class PhotosController : ControllerBase
{
    private readonly IPhotoService _photoService;

    public PhotosController(IPhotoService photoService)
    {
        _photoService = photoService;
    }

    /// <summary>Generate a pre-signed blob upload URL for direct client-side upload.</summary>
    [HttpPost("upload-url")]
    public async Task<IActionResult> GetUploadUrl([FromBody] UploadUrlRequest request)
    {
        var userId = GetUserId();
        var result = await _photoService.GenerateUploadUrlAsync(userId, request);
        return Ok(result);
    }

    private Guid GetUserId() =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
}
