using FoodDiary.Api.DTOs.Responses;

namespace FoodDiary.Api.Models;

public class Entry
{
    public Guid Id { get; set; }

    public Guid UserId { get; set; }

    public Guid RestaurantId { get; set; }
    public Restaurant? Restaurant { get; set; }

    public DateTime VisitedAt { get; set; }
    public decimal Rating { get; set; }
    public string? Caption { get; set; }
    public string? PhotoUrl { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
