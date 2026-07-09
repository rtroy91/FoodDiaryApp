using System.Security.Claims;
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

    /// <summary>Upload a diary photo to local backend storage.</summary>
    [HttpPost("upload")]
    [RequestSizeLimit(5 * 1024 * 1024)]
    public async Task<IActionResult> Upload([FromForm] IFormFile? photo)
    {
        if (photo is null)
            return BadRequest(new { message = "Photo file is required." });

        try
        {
            var userId = GetUserId();
            var baseUrl = $"{Request.Scheme}://{Request.Host}";
            var result = await _photoService.UploadAsync(userId, photo, baseUrl);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    private Guid GetUserId() =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
}
