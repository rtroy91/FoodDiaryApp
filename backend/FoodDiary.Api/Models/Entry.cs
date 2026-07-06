namespace FoodDiary.Api.Models;

public class Entry
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public Guid RestaurantId { get; set; }
    public Restaurant? Restaurant { get; set; }

    public DateTime VisitedAt { get; set; } = DateTime.UtcNow;
    public int Rating { get; set; } // 1–5
    public string? Caption { get; set; }
    public string? PhotoUrl { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
