using System.ComponentModel.DataAnnotations;

namespace FoodDiary.Api.DTOs.Requests;

public class UploadUrlRequest
{
    [Required]
    public string FileName { get; set; } = string.Empty;

    [Required]
    public string ContentType { get; set; } = string.Empty;
}
