using System.ComponentModel.DataAnnotations;

namespace FoodDiary.Api.DTOs.Requests;

public class CreateEntryRequest
{
    [Required]
    public Guid RestaurantId { get; set; }

    [Required]
    public DateTime VisitedAt { get; set; }

    [Range(typeof(decimal), "0.5", "5")]
    public decimal Rating { get; set; }

    public string? Caption { get; set; }

    [Required]
    public string PhotoUrl { get; set; } = string.Empty;
}

public class UpdateEntryRequest
{
    [Required]
    public Guid RestaurantId { get; set; }

    [Required]
    public DateTime VisitedAt { get; set; }

    [Range(typeof(decimal), "0.5", "5")]
    public decimal Rating { get; set; }

    public string? Caption { get; set; }
    public string? PhotoUrl { get; set; }
}
