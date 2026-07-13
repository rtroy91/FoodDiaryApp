namespace FoodDiary.Api.Models;

public class Restaurant
{
    public Guid Id { get; set; }

    public string Name { get; set; } = string.Empty;
    public string? Address { get; set; }
    public string? Barangay { get; set; }
    public string? City { get; set; }
    public string? Province { get; set; }
    public string? Category { get; set; }
    public string? MenuPhotoUrl { get; set; }
    public string? StorePhotoUrl { get; set; }
    public string? Promo { get; set; }
    public string? Budget { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }

    public List<Entry> Entries { get; set; } = new();
    public List<RestaurantOpeningHour> OpeningHours { get; set; } = new();
}
