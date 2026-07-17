using System.Net.Http.Headers;
using System.Net.Http.Json;
using FoodDiary.Api.DTOs.Responses;
using FoodDiary.Api.Interfaces;
using Microsoft.AspNetCore.Http;

namespace FoodDiary.Api.Services;

public class PhotoService(
    IWebHostEnvironment environment,
    ILogger<PhotoService> logger,
    IConfiguration config,
    IHttpClientFactory httpClientFactory) : IPhotoService
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

        if (UsesSupabaseStorage())
        {
            return await UploadToSupabaseAsync(
                userId,
                photo,
                safeUploadFolder,
                fileName,
                usesUserFolder,
                cancellationToken);
        }

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

        if (UsesSupabaseStorage())
        {
            return DeleteFromSupabaseAsync(photoUrl);
        }

        var relativePath = GetRelativeUploadPath(photoUrl);
        if (relativePath is null)
            return Task.CompletedTask;

        DeleteLocalFile(photoUrl, relativePath);
        return Task.CompletedTask;
    }

    private void DeleteLocalFile(string photoUrl, string relativePath)
    {
        var root = GetUploadRoot();
        var absolutePath = Path.GetFullPath(Path.Combine(root, relativePath));

        var rootWithSeparator = Path.EndsInDirectorySeparator(root)
            ? root
            : root + Path.DirectorySeparatorChar;

        if (!absolutePath.StartsWith(rootWithSeparator, StringComparison.OrdinalIgnoreCase))
            return;

        try
        {
            if (File.Exists(absolutePath))
                File.Delete(absolutePath);
        }
        catch (IOException ex)
        {
            logger.LogWarning(ex, "Could not delete photo file {PhotoUrl}", photoUrl);
        }
        catch (UnauthorizedAccessException ex)
        {
            logger.LogWarning(ex, "Could not delete photo file {PhotoUrl}", photoUrl);
        }
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
        var webRoot = environment.WebRootPath;
        if (string.IsNullOrWhiteSpace(webRoot))
            webRoot = Path.Combine(environment.ContentRootPath, "wwwroot");

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

    private async Task<PhotoUploadResponse> UploadToSupabaseAsync(
        Guid userId,
        IFormFile photo,
        string uploadFolder,
        string fileName,
        bool usesUserFolder,
        CancellationToken cancellationToken)
    {
        var objectPath = usesUserFolder
            ? $"{uploadFolder}/{userId}/{fileName}"
            : $"{uploadFolder}/{fileName}";

        var objectUrl = BuildSupabaseObjectUrl(objectPath);
        var client = httpClientFactory.CreateClient();

        await using var photoStream = photo.OpenReadStream();
        using var content = new StreamContent(photoStream);
        content.Headers.ContentType = new MediaTypeHeaderValue(photo.ContentType);

        using var request = new HttpRequestMessage(HttpMethod.Post, objectUrl)
        {
            Content = content
        };
        AddSupabaseHeaders(request);
        request.Headers.TryAddWithoutValidation("x-upsert", "false");

        using var response = await client.SendAsync(request, cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            var body = await response.Content.ReadAsStringAsync(cancellationToken);
            throw new InvalidOperationException($"Supabase could not upload the photo. {body}");
        }

        return new PhotoUploadResponse
        {
            PhotoUrl = BuildSupabasePublicUrl(objectPath)
        };
    }

    private async Task DeleteFromSupabaseAsync(string photoUrl)
    {
        var objectPath = GetSupabaseObjectPath(photoUrl);
        if (objectPath is null)
        {
            var relativePath = GetRelativeUploadPath(photoUrl);
            if (relativePath is not null)
                DeleteLocalFile(photoUrl, relativePath);

            return;
        }

        var bucket = GetSupabaseBucket();
        var deleteUrl = $"{GetSupabaseUrl()}/storage/v1/object/{Uri.EscapeDataString(bucket)}";
        var client = httpClientFactory.CreateClient();

        using var request = new HttpRequestMessage(HttpMethod.Delete, deleteUrl)
        {
            Content = JsonContent.Create(new { prefixes = new[] { objectPath } })
        };
        AddSupabaseHeaders(request);

        try
        {
            using var response = await client.SendAsync(request);
            if (!response.IsSuccessStatusCode)
            {
                var body = await response.Content.ReadAsStringAsync();
                logger.LogWarning("Supabase could not delete photo file {PhotoUrl}. {Response}", photoUrl, body);
            }
        }
        catch (HttpRequestException ex)
        {
            logger.LogWarning(ex, "Supabase could not delete photo file {PhotoUrl}", photoUrl);
        }
    }

    private bool UsesSupabaseStorage() =>
        string.Equals(config["PhotoStorage:Provider"] ?? config["PHOTO_STORAGE_PROVIDER"], "Supabase", StringComparison.OrdinalIgnoreCase);

    private string GetSupabaseUrl()
    {
        var url = config["SupabaseStorage:Url"] ?? config["SUPABASE_STORAGE_URL"];
        if (string.IsNullOrWhiteSpace(url))
            throw new InvalidOperationException("Supabase storage URL is not configured.");

        return url.TrimEnd('/');
    }

    private string GetSupabaseServiceRoleKey()
    {
        var serviceRoleKey = config["SupabaseStorage:ServiceRoleKey"] ?? config["SUPABASE_STORAGE_SERVICE_ROLE_KEY"];
        if (string.IsNullOrWhiteSpace(serviceRoleKey))
            throw new InvalidOperationException("Supabase storage service role key is not configured.");

        return serviceRoleKey;
    }

    private string GetSupabaseBucket()
    {
        var bucket = config["SupabaseStorage:Bucket"] ?? config["SUPABASE_STORAGE_BUCKET"] ?? "food-photos";
        if (string.IsNullOrWhiteSpace(bucket))
            throw new InvalidOperationException("Supabase storage bucket is not configured.");

        return bucket;
    }

    private string BuildSupabaseObjectUrl(string objectPath) =>
        $"{GetSupabaseUrl()}/storage/v1/object/{Uri.EscapeDataString(GetSupabaseBucket())}/{EscapeObjectPath(objectPath)}";

    private string BuildSupabasePublicUrl(string objectPath) =>
        $"{GetSupabaseUrl()}/storage/v1/object/public/{Uri.EscapeDataString(GetSupabaseBucket())}/{EscapeObjectPath(objectPath)}";

    private void AddSupabaseHeaders(HttpRequestMessage request)
    {
        var serviceRoleKey = GetSupabaseServiceRoleKey();
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", serviceRoleKey);
        request.Headers.TryAddWithoutValidation("apikey", serviceRoleKey);
    }

    private string? GetSupabaseObjectPath(string photoUrl)
    {
        if (!Uri.TryCreate(photoUrl, UriKind.Absolute, out var uri))
            return null;

        var bucket = GetSupabaseBucket();
        var marker = $"/storage/v1/object/public/{bucket}/";
        var path = Uri.UnescapeDataString(uri.AbsolutePath);
        var markerIndex = path.IndexOf(marker, StringComparison.OrdinalIgnoreCase);

        return markerIndex >= 0
            ? path[(markerIndex + marker.Length)..]
            : null;
    }

    private static string EscapeObjectPath(string objectPath) =>
        string.Join("/", objectPath.Split('/').Select(Uri.EscapeDataString));
}
