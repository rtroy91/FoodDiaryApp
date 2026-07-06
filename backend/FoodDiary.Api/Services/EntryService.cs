using FoodDiary.Api.Data;
using FoodDiary.Api.DTOs.Requests;
using FoodDiary.Api.DTOs.Responses;
using FoodDiary.Api.Interfaces;
using FoodDiary.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace FoodDiary.Api.Services;

public class EntryService : IEntryService
{
    private readonly FoodDiaryContext _context;

    public EntryService(FoodDiaryContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<EntryResponse>> GetAllAsync(Guid userId, Guid? restaurantId)
    {
        var query = _context.Entries
            .Include(e => e.Restaurant)
            .Where(e => e.UserId == userId);

        if (restaurantId.HasValue)
            query = query.Where(e => e.RestaurantId == restaurantId.Value);

        return await query
            .OrderByDescending(e => e.VisitedAt)
            .Select(e => MapToResponse(e))
            .ToListAsync();
    }

    public async Task<IEnumerable<EntryResponse>> GetRecentAsync(Guid userId, int limit)
    {
        return await _context.Entries
            .Include(e => e.Restaurant)
            .Where(e => e.UserId == userId)
            .OrderByDescending(e => e.VisitedAt)
            .Take(limit)
            .Select(e => MapToResponse(e))
            .ToListAsync();
    }

    public async Task<EntryResponse?> GetByIdAsync(Guid id, Guid userId)
    {
        var entry = await _context.Entries
            .Include(e => e.Restaurant)
            .FirstOrDefaultAsync(e => e.Id == id && e.UserId == userId);

        return entry is null ? null : MapToResponse(entry);
    }

    public async Task<EntryResponse> CreateAsync(Guid userId, CreateEntryRequest request)
    {
        // Business rule: the restaurant must belong to this user
        var restaurant = await _context.Restaurants
            .FirstOrDefaultAsync(r => r.Id == request.RestaurantId && r.UserId == userId)
            ?? throw new KeyNotFoundException("Restaurant not found.");

        var entry = new Entry
        {
            UserId = userId,
            RestaurantId = request.RestaurantId,
            VisitedAt = request.VisitedAt,
            Rating = request.Rating,
            Caption = request.Caption,
            PhotoUrl = request.PhotoUrl
        };

        _context.Entries.Add(entry);
        await _context.SaveChangesAsync();

        entry.Restaurant = restaurant;
        return MapToResponse(entry);
    }

    public async Task<EntryResponse?> UpdateAsync(Guid id, Guid userId, UpdateEntryRequest request)
    {
        var entry = await _context.Entries
            .Include(e => e.Restaurant)
            .FirstOrDefaultAsync(e => e.Id == id && e.UserId == userId);

        if (entry is null) return null;

        entry.VisitedAt = request.VisitedAt;
        entry.Rating = request.Rating;
        entry.Caption = request.Caption;
        entry.PhotoUrl = request.PhotoUrl;

        await _context.SaveChangesAsync();

        return MapToResponse(entry);
    }

    public async Task<bool> DeleteAsync(Guid id, Guid userId)
    {
        var entry = await _context.Entries
            .FirstOrDefaultAsync(e => e.Id == id && e.UserId == userId);

        if (entry is null) return false;

        _context.Entries.Remove(entry);
        await _context.SaveChangesAsync();
        return true;
    }

    // ── Mapping ───────────────────────────────────────────────────────────

    private static EntryResponse MapToResponse(Entry e) => new()
    {
        Id = e.Id,
        RestaurantId = e.RestaurantId,
        RestaurantName = e.Restaurant?.Name ?? string.Empty,
        VisitedAt = e.VisitedAt,
        Rating = e.Rating,
        Caption = e.Caption,
        PhotoUrl = e.PhotoUrl,
        CreatedAt = e.CreatedAt
    };
}
