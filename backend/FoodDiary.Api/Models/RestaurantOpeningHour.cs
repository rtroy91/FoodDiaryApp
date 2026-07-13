namespace FoodDiary.Api.Models;

public class RestaurantOpeningHour
{
    public Guid Id { get; set; }
    public Guid RestaurantId { get; set; }
    public Restaurant? Restaurant { get; set; }
    public int Day { get; set; }
    public string? Open { get; set; }
    public string? Close { get; set; }
}
