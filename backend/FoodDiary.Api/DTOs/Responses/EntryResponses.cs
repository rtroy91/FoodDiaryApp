namespace FoodDiary.Api.DTOs.Responses;

public class EntryListResponse
{
    public Guid Id { get; set; }
    public DateTime VisitedAt { get; set; }
    public decimal Rating { get; set; }
    public string? Caption { get; set; }
    public string? PhotoUrl { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    public EntryListRestaurantResponse? Restaurant { get; set; }
}

public class EntryListRestaurantResponse
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Barangay { get; set; }
    public string? City { get; set; }
    public string? Province { get; set; }
    public string? Category { get; set; }
    public string? StorePhotoUrl { get; set; }
}
