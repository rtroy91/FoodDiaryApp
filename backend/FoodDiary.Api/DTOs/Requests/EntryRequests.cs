using System.ComponentModel.DataAnnotations;

namespace FoodDiary.Api.DTOs.Requests;

public class CreateEntryRequest
{
    [Required]
    public Guid RestaurantId { get; set; }

    [Required]
    public DateTime VisitedAt { get; set; }

    [Range(1, 5)]
    public int Rating { get; set; }

    public string? Caption { get; set; }
    public string? PhotoUrl { get; set; }
}

public class UpdateEntryRequest
{
    [Required]
    public DateTime VisitedAt { get; set; }

    [Range(1, 5)]
    public int Rating { get; set; }

    public string? Caption { get; set; }
    public string? PhotoUrl { get; set; }
}
