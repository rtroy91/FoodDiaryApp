using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Azure.Storage.Sas;
using FoodDiary.Api.DTOs.Requests;
using FoodDiary.Api.DTOs.Responses;
using FoodDiary.Api.Interfaces;

namespace FoodDiary.Api.Services;

public class PhotoService : IPhotoService
{
    private readonly BlobServiceClient _blobServiceClient;
    private const string ContainerName = "diary-photos";

    public PhotoService(BlobServiceClient blobServiceClient)
    {
        _blobServiceClient = blobServiceClient;
    }

    public async Task<UploadUrlResponse> GenerateUploadUrlAsync(Guid userId, UploadUrlRequest request)
    {
        var container = _blobServiceClient.GetBlobContainerClient(ContainerName);
        await container.CreateIfNotExistsAsync(PublicAccessType.Blob);

        var blobName = $"{userId}/{Guid.NewGuid()}-{request.FileName}";
        var blobClient = container.GetBlobClient(blobName);

        var sasBuilder = new BlobSasBuilder
        {
            BlobContainerName = ContainerName,
            BlobName = blobName,
            Resource = "b",
            ExpiresOn = DateTimeOffset.UtcNow.AddMinutes(15),
            ContentType = request.ContentType
        };
        sasBuilder.SetPermissions(BlobSasPermissions.Write | BlobSasPermissions.Create);

        return new UploadUrlResponse
        {
            UploadUrl = blobClient.GenerateSasUri(sasBuilder).ToString(),
            PublicUrl = blobClient.Uri.ToString()
        };
    }
}
