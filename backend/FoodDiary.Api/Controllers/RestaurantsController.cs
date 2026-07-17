using System.Security.Claims;
using FoodDiary.Api.DTOs.Requests;
using FoodDiary.Api.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FoodDiary.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/restaurants")]
public class RestaurantsController(IRestaurantService restaurantService) : ControllerBase
{
    [HttpGet("restaurant-lists")]
    public async Task<IActionResult> GetRestaurantLists(CancellationToken cancellationToken)
    {
        var result = await restaurantService.GetRestaurantListsAsync(cancellationToken);
        return Ok(result);
    }

    [HttpGet("options")]
    public async Task<IActionResult> GetRestaurantOptions(CancellationToken cancellationToken)
    {
        var result = await restaurantService.GetRestaurantOptionsAsync(cancellationToken);
        return Ok(result);
    }

    [HttpGet("most-visited")]
    public async Task<IActionResult> GetMostVisited([FromQuery] int limit = 10, CancellationToken cancellationToken = default)
    {
        var userId = GetUserId();
        var result = await restaurantService.GetMostVisitedAsync(userId, limit, cancellationToken);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        var result = await restaurantService.GetByIdAsync(id, cancellationToken);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody] CreateRestaurantRequest request, CancellationToken cancellationToken)
    {
        var result = await restaurantService.CreateAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateRestaurantRequest request, CancellationToken cancellationToken)
    {
        var result = await restaurantService.UpdateAsync(id, request, cancellationToken);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var deleted = await restaurantService.DeleteAsync(id, cancellationToken);
        return deleted ? NoContent() : NotFound();
    }

    private Guid GetUserId() =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
}
