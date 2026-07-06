namespace FoodDiary.Api.DTOs.Responses;

public class EntryResponse
{
    public Guid Id { get; set; }
    public Guid RestaurantId { get; set; }
    public string RestaurantName { get; set; } = string.Empty;
    public DateTime VisitedAt { get; set; }
    public int Rating { get; set; }
    public string? Caption { get; set; }
    public string? PhotoUrl { get; set; }
    public DateTime CreatedAt { get; set; }
}
