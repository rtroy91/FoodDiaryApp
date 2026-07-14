namespace FoodDiary.Api.DTOs.Responses;

/// <summary>Represents a user visible to admins.</summary>
public sealed record UserResponse(
    Guid Id,
    string Email,
    string? DisplayName,
    string Role,
    DateTime CreatedAt);
