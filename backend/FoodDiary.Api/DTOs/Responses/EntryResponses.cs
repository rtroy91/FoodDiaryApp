namespace FoodDiary.Api.DTOs.Responses;

public class EntryResponse
{
    public Guid Id { get; set; }
    public DateTime VisitedAt { get; set; }
    public decimal Rating { get; set; }
    public string? Caption { get; set; }
    public string? PhotoUrl { get; set; }

    public EntryRestaurantResponse? Restaurant { get; set; }
}

public class EntryRestaurantResponse
{
     public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Address { get; set; }
    public string? Barangay { get; set; }
    public string? City { get; set; }
    public string? Province { get; set; }
    public string? Category { get; set; }
}
