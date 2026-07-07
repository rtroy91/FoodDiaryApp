using System.Security.Claims;
using FoodDiary.Api.DTOs.Requests;
using FoodDiary.Api.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FoodDiary.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/entries")]
public class EntriesController : ControllerBase
{
    private readonly IEntryService _entryService;

    public EntriesController(IEntryService entryService)
    {
        _entryService = entryService;
    }

    /// <summary>Get all diary entries, optionally filtered by restaurant.</summary>
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] Guid? restaurantId)
    {
        var userId = GetUserId();
        var result = await _entryService.GetAllAsync(userId, restaurantId);
        return Ok(result);
    }

    [HttpGet("recent-entries")]
    public async Task<IActionResult> GetRecentEntries([FromQuery] int limit = 20)
    {
        var userId = GetUserId();
        var result = await _entryService.GetRecentEntries(userId, limit);
        return Ok(result);
    }

    /// <summary>Get a single diary entry by ID.</summary>
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var userId = GetUserId();
        var result = await _entryService.GetByIdAsync(id, userId);
        return result is null ? NotFound() : Ok(result);
    }

    /// <summary>Create a new diary entry (log a visit).</summary>
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateEntryRequest request)
    {
        try
        {
            var userId = GetUserId();
            var result = await _entryService.CreateAsync(userId, request);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    /// <summary>Update an existing diary entry.</summary>
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateEntryRequest request)
    {
        var userId = GetUserId();
        var result = await _entryService.UpdateAsync(id, userId, request);
        return result is null ? NotFound() : Ok(result);
    }

    /// <summary>Delete a diary entry.</summary>
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var userId = GetUserId();
        var deleted = await _entryService.DeleteAsync(id, userId);
        return deleted ? NoContent() : NotFound();
    }

    private Guid GetUserId() =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
}
