using System.ComponentModel.DataAnnotations;

namespace FoodDiary.Api.DTOs.Requests;

public class CreateRestaurantRequest
{
    [Required]
    public string Name { get; set; } = string.Empty;

    public string? Address { get; set; }
    public string? Barangay { get; set; }
    public string? City { get; set; }
    public string? Province { get; set; }
    public string? Category { get; set; }
    // public double Latitude { get; set; }
    // public double Longitude { get; set; }
}

public class UpdateRestaurantRequest
{
    [Required]
    public string Name { get; set; } = string.Empty;

    public string? Address { get; set; }
    public string? Barangay { get; set; }
    public string? City { get; set; }
    public string? Province { get; set; }
    public string? Category { get; set; }
    // public double Latitude { get; set; }
    // public double Longitude { get; set; }
}
