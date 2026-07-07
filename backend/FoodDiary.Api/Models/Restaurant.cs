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

    public List<Entry> Entries { get; set; } = new();
}
