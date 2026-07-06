namespace FoodDiary.Api.DTOs.Responses;

public class RestaurantResponse
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Address { get; set; }
    public string? Barangay { get; set; }
    public string? City { get; set; }
    public string? Province { get; set; }
    public string? Category { get; set; }
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public int VisitCount { get; set; }
    public double? AverageRating { get; set; }
    public DateTime CreatedAt { get; set; }
}
