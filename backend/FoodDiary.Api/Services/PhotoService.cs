using FoodDiary.Api.DTOs.Responses;
using FoodDiary.Api.Interfaces;
using Microsoft.AspNetCore.Http;

namespace FoodDiary.Api.Services;

public class PhotoService : IPhotoService
{
    private const long MaxFileSize = 5 * 1024 * 1024;
    private const string DefaultUploadFolder = "entry-photos";
    private const string UploadsRootPath = "uploads";

    private static readonly HashSet<string> AllowedUploadFolders = new(StringComparer.OrdinalIgnoreCase)
    {
        "entry-photos",
        "store-menu",
        "store-icon"
    };

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
        string uploadFolder,
        CancellationToken cancellationToken)
    {
        ValidatePhoto(photo);
        var safeUploadFolder = NormalizeUploadFolder(uploadFolder);

        var extension = Path.GetExtension(photo.FileName).ToLowerInvariant();
        var fileName = $"{Guid.NewGuid():N}{extension}";
        var usesUserFolder = safeUploadFolder.Equals(DefaultUploadFolder, StringComparison.OrdinalIgnoreCase);
        var relativePath = usesUserFolder
            ? $"{UploadsRootPath}/{safeUploadFolder}/{userId}/{fileName}"
            : $"{UploadsRootPath}/{safeUploadFolder}/{fileName}";
        var absolutePath = usesUserFolder
            ? GetAbsoluteUploadPath(safeUploadFolder, userId.ToString(), fileName)
            : GetAbsoluteUploadPath(safeUploadFolder, fileName);

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

    private string GetAbsoluteUploadPath(string uploadFolder, string userFolder, string fileName)
    {
        var root = GetUploadRoot(uploadFolder);
        return Path.GetFullPath(Path.Combine(root, userFolder, fileName));
    }

    private string GetAbsoluteUploadPath(string uploadFolder, string fileName)
    {
        var root = GetUploadRoot(uploadFolder);
        return Path.GetFullPath(Path.Combine(root, fileName));
    }

    private string GetUploadRoot(string? uploadFolder = null)
    {
        var webRoot = _environment.WebRootPath;
        if (string.IsNullOrWhiteSpace(webRoot))
            webRoot = Path.Combine(_environment.ContentRootPath, "wwwroot");

        var root = string.IsNullOrWhiteSpace(uploadFolder)
            ? Path.GetFullPath(Path.Combine(webRoot, UploadsRootPath))
            : Path.GetFullPath(Path.Combine(webRoot, UploadsRootPath, NormalizeUploadFolder(uploadFolder)));
        Directory.CreateDirectory(root);
        return root;
    }

    private static string NormalizeUploadFolder(string? uploadFolder)
    {
        if (string.IsNullOrWhiteSpace(uploadFolder))
            return DefaultUploadFolder;

        if (!AllowedUploadFolders.Contains(uploadFolder))
            throw new InvalidOperationException("Upload folder is not supported.");

        return uploadFolder;
    }

    private static string? GetRelativeUploadPath(string photoUrl)
    {
        var path = photoUrl;
        if (Uri.TryCreate(photoUrl, UriKind.Absolute, out var uri))
            path = uri.AbsolutePath;

        path = path.Replace('\\', '/').TrimStart('/');

        const string prefix = $"{UploadsRootPath}/";
        return path.StartsWith(prefix, StringComparison.OrdinalIgnoreCase)
            ? path[prefix.Length..]
            : null;
    }
}
