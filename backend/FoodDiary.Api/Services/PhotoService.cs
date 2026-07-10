using FoodDiary.Api.DTOs.Responses;
using FoodDiary.Api.Interfaces;
using Microsoft.AspNetCore.Http;

namespace FoodDiary.Api.Services;

public class PhotoService : IPhotoService
{
    private const long MaxFileSize = 5 * 1024 * 1024;
    private const string UploadsPath = "uploads/entry-photos";

    private static readonly Dictionary<string, string[]> AllowedExtensions = new(StringComparer.OrdinalIgnoreCase)
    {
        [".jpg"] = ["image/jpeg"],
        [".jpeg"] = ["image/jpeg"],
        [".png"] = ["image/png"],
        [".webp"] = ["image/webp"],
        [".jfif"] = ["image/jpeg", "image/jfif"]
    };

    private readonly IWebHostEnvironment _environment;
    private readonly ILogger<PhotoService> _logger;

    public PhotoService(IWebHostEnvironment environment, ILogger<PhotoService> logger)
    {
        _environment = environment;
        _logger = logger;
    }

    public async Task<PhotoUploadResponse> UploadAsync(
        Guid userId,
        IFormFile photo,
        string baseUrl,
        CancellationToken cancellationToken)
    {
        ValidatePhoto(photo);

        var extension = Path.GetExtension(photo.FileName).ToLowerInvariant();
        var fileName = $"{Guid.NewGuid():N}{extension}";
        var relativePath = $"{UploadsPath}/{userId}/{fileName}";
        var absolutePath = GetAbsoluteUploadPath(userId.ToString(), fileName);

        Directory.CreateDirectory(Path.GetDirectoryName(absolutePath)!);

        await using var stream = File.Create(absolutePath);
        await photo.CopyToAsync(stream, cancellationToken);

        return new PhotoUploadResponse
        {
            PhotoUrl = $"{baseUrl.TrimEnd('/')}/{relativePath}"
        };
    }

    public Task DeleteAsync(string? photoUrl)
    {
        if (string.IsNullOrWhiteSpace(photoUrl))
            return Task.CompletedTask;

        var relativePath = GetRelativeUploadPath(photoUrl);
        if (relativePath is null)
            return Task.CompletedTask;

        var root = GetUploadRoot();
        var absolutePath = Path.GetFullPath(Path.Combine(root, relativePath));

        var rootWithSeparator = Path.EndsInDirectorySeparator(root)
            ? root
            : root + Path.DirectorySeparatorChar;

        if (!absolutePath.StartsWith(rootWithSeparator, StringComparison.OrdinalIgnoreCase))
            return Task.CompletedTask;

        try
        {
            if (File.Exists(absolutePath))
                File.Delete(absolutePath);
        }
        catch (IOException ex)
        {
            _logger.LogWarning(ex, "Could not delete photo file {PhotoUrl}", photoUrl);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Could not delete photo file {PhotoUrl}", photoUrl);
        }

        return Task.CompletedTask;
    }

    private static void ValidatePhoto(IFormFile photo)
    {
        if (photo.Length == 0)
            throw new InvalidOperationException("Photo file is empty.");

        if (photo.Length > MaxFileSize)
            throw new InvalidOperationException("Photo must be 5 MB or smaller.");

        var extension = Path.GetExtension(photo.FileName);
        if (!AllowedExtensions.TryGetValue(extension, out var expectedContentTypes) ||
            !expectedContentTypes.Contains(photo.ContentType, StringComparer.OrdinalIgnoreCase))
        {
            throw new InvalidOperationException("Only JPG, PNG, JFIF, or WEBP images are allowed.");
        }
    }

    private string GetAbsoluteUploadPath(string userFolder, string fileName)
    {
        var root = GetUploadRoot();
        return Path.GetFullPath(Path.Combine(root, userFolder, fileName));
    }

    private string GetUploadRoot()
    {
        var webRoot = _environment.WebRootPath;
        if (string.IsNullOrWhiteSpace(webRoot))
            webRoot = Path.Combine(_environment.ContentRootPath, "wwwroot");

        var root = Path.GetFullPath(Path.Combine(webRoot, UploadsPath));
        Directory.CreateDirectory(root);
        return root;
    }

    private static string? GetRelativeUploadPath(string photoUrl)
    {
        var path = photoUrl;
        if (Uri.TryCreate(photoUrl, UriKind.Absolute, out var uri))
            path = uri.AbsolutePath;

        path = path.Replace('\\', '/').TrimStart('/');

        const string prefix = $"{UploadsPath}/";
        return path.StartsWith(prefix, StringComparison.OrdinalIgnoreCase)
            ? path[prefix.Length..]
            : null;
    }
}
