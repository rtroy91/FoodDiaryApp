using System.Security.Claims;
using FoodDiary.Api.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FoodDiary.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/photos")]
public class PhotosController(IPhotoService photoService) : ControllerBase
{
    /// <summary>Upload a diary photo to local backend storage.</summary>
    [HttpPost("upload")]
    [RequestSizeLimit(5 * 1024 * 1024)]
    public async Task<IActionResult> Upload(
        [FromForm] IFormFile? photo,
        [FromQuery] string uploadFolder = "entry-photos",
        CancellationToken cancellationToken = default)
    {
        if (photo is null)
            throw new InvalidOperationException("Photo file is required.");

        var userId = GetUserId();
        var baseUrl = $"{Request.Scheme}://{Request.Host}";
        var result = await photoService.UploadAsync(userId, photo, baseUrl, uploadFolder, cancellationToken);
        return Ok(result);
    }

    private Guid GetUserId() =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
}
