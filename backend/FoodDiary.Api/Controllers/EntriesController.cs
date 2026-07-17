using System.Security.Claims;
using FoodDiary.Api.DTOs.Requests;
using FoodDiary.Api.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FoodDiary.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/entries")]
public class EntriesController(IEntryService entryService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] Guid? restaurantId, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var result = await entryService.GetAllAsync(userId, restaurantId, cancellationToken);
        return Ok(result);
    }

    [HttpGet("recent-entries")]
    public async Task<IActionResult> GetRecentEntries([FromQuery] int limit = 20, CancellationToken cancellationToken = default)
    {
        var userId = GetUserId();
        var result = await entryService.GetRecentEntriesAsync(userId, limit, cancellationToken);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var result = await entryService.GetByIdAsync(id, userId, cancellationToken);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateEntryRequest request, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var result = await entryService.CreateAsync(userId, request, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateEntryRequest request, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var result = await entryService.UpdateAsync(id, userId, request, cancellationToken);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var deleted = await entryService.DeleteAsync(id, userId, cancellationToken);
        return deleted ? NoContent() : NotFound();
    }

    private Guid GetUserId() =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
}
