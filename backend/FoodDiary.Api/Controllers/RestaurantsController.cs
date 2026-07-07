using System.Security.Claims;
using FoodDiary.Api.DTOs.Requests;
using FoodDiary.Api.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FoodDiary.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/restaurants")]
public class RestaurantsController : ControllerBase
{
    private readonly IRestaurantService _restaurantService;

    public RestaurantsController(IRestaurantService restaurantService)
    {
        _restaurantService = restaurantService;
    }

    [HttpGet("restaurant-lists")]
    public async Task<IActionResult> GetRestaurantLists()
    {
        var result = await _restaurantService.GetRestaurantLists();
        return Ok(result);
    }

    /// <summary>Find restaurants within a radius of a given coordinate.</summary>
    // [HttpGet("nearby")]
    // public async Task<IActionResult> GetNearby(
    //     [FromQuery] double lat,
    //     [FromQuery] double lng,
    //     [FromQuery] double radiusKm = 5)
    // {
    //     var userId = GetUserId();
    //     var result = await _restaurantService.GetNearbyAsync(userId, lat, lng, radiusKm);
    //     return Ok(result);
    // }

    /// <summary>Get top N most-visited restaurants for the current user.</summary>
    [HttpGet("most-visited")]
    public async Task<IActionResult> GetMostVisited([FromQuery] int limit = 10)
    {
        var userId = GetUserId();
        var result = await _restaurantService.GetMostVisitedAsync(userId, limit);
        return Ok(result);
    }

    /// <summary>Get a single restaurant by ID.</summary>
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var userId = GetUserId();
        var result = await _restaurantService.GetByIdAsync(id, userId);
        return result is null ? NotFound() : Ok(result);
    }

    /// <summary>Create a new restaurant.</summary>
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateRestaurantRequest request)
    {
        var userId = GetUserId();
        var result = await _restaurantService.CreateAsync(userId, request);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    /// <summary>Update an existing restaurant.</summary>
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateRestaurantRequest request)
    {
        var userId = GetUserId();
        var result = await _restaurantService.UpdateAsync(id, userId, request);
        return result is null ? NotFound() : Ok(result);
    }

    /// <summary>Delete a restaurant and all its diary entries.</summary>
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var userId = GetUserId();
        var deleted = await _restaurantService.DeleteAsync(id, userId);
        return deleted ? NoContent() : NotFound();
    }

    private Guid GetUserId() =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
}
