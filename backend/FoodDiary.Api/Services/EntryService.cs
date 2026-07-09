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
    private readonly IPhotoService _photoService;

    public EntryService(FoodDiaryContext context, IPhotoService photoService)
    {
        _context = context;
        _photoService = photoService;
    }

    public async Task<IEnumerable<EntryResponse>> GetAllAsync(Guid userId, Guid? restaurantId, CancellationToken cancellationToken)
    {
        var query = _context.Entries
            .AsNoTracking()
            .Where(e => e.UserId == userId);

        if (restaurantId.HasValue)
            query = query.Where(e => e.RestaurantId == restaurantId.Value);

        return await query
            .OrderByDescending(e => e.VisitedAt)
            .Select(e => new EntryResponse
            {
                Id = e.Id,
                VisitedAt = e.VisitedAt,
                Rating = e.Rating,
                Caption = e.Caption,
                PhotoUrl = e.PhotoUrl,
                CreatedAt = e.CreatedAt,
                UpdatedAt = e.UpdatedAt,
                Restaurant = e.Restaurant == null ? null : new EntryRestaurantResponse
                {
                    Id = e.Restaurant.Id,
                    Name = e.Restaurant.Name,
                    Address = e.Restaurant.Address,
                    Barangay = e.Restaurant.Barangay,
                    City = e.Restaurant.City,
                    Province = e.Restaurant.Province,
                    Category = e.Restaurant.Category
                }
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<List<EntryResponse>> GetRecentEntriesAsync(Guid userId, int limit, CancellationToken cancellationToken)
    {
        return await _context.Entries
            .AsNoTracking()
            .Where(e => e.UserId == userId)
            .OrderByDescending(e => e.VisitedAt)
            .Take(limit)
            .Select(e => new EntryResponse
            {
                Id = e.Id,
                VisitedAt = e.VisitedAt,
                Rating = e.Rating,
                Caption = e.Caption,
                PhotoUrl = e.PhotoUrl,
                CreatedAt = e.CreatedAt,
                UpdatedAt = e.UpdatedAt,
                Restaurant = e.Restaurant == null ? null : new EntryRestaurantResponse
                {
                    Id = e.Restaurant.Id,
                    Name = e.Restaurant.Name,
                    Address = e.Restaurant.Address,
                    Barangay = e.Restaurant.Barangay,
                    City = e.Restaurant.City,
                    Province = e.Restaurant.Province,
                    Category = e.Restaurant.Category
                }
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<EntryResponse?> GetByIdAsync(Guid id, Guid userId, CancellationToken cancellationToken)
    {
        return await _context.Entries
            .AsNoTracking()
            .Where(e => e.Id == id && e.UserId == userId)
            .Select(e => new EntryResponse
            {
                Id = e.Id,
                VisitedAt = e.VisitedAt,
                Rating = e.Rating,
                Caption = e.Caption,
                PhotoUrl = e.PhotoUrl,
                CreatedAt = e.CreatedAt,
                UpdatedAt = e.UpdatedAt,
                Restaurant = e.Restaurant == null ? null : new EntryRestaurantResponse
                {
                    Id = e.Restaurant.Id,
                    Name = e.Restaurant.Name,
                    Address = e.Restaurant.Address,
                    Barangay = e.Restaurant.Barangay,
                    City = e.Restaurant.City,
                    Province = e.Restaurant.Province,
                    Category = e.Restaurant.Category
                }
            })
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<EntryResponse> CreateAsync(Guid userId, CreateEntryRequest request, CancellationToken cancellationToken)
    {
        var restaurant = await _context.Restaurants
            .AsNoTracking()
            .FirstOrDefaultAsync(r => r.Id == request.RestaurantId, cancellationToken)
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
        await _context.SaveChangesAsync(cancellationToken);

        entry.Restaurant = restaurant;
        return MapToResponse(entry);
    }

    public async Task<EntryResponse?> UpdateAsync(Guid id, Guid userId, UpdateEntryRequest request, CancellationToken cancellationToken)
    {
        var entry = await _context.Entries
            .FirstOrDefaultAsync(e => e.Id == id && e.UserId == userId, cancellationToken);

        if (entry is null) return null;

        var restaurant = await _context.Restaurants
            .AsNoTracking()
            .FirstOrDefaultAsync(r => r.Id == request.RestaurantId, cancellationToken)
            ?? throw new KeyNotFoundException("Restaurant not found.");

        entry.RestaurantId = request.RestaurantId;
        entry.VisitedAt = request.VisitedAt;
        entry.Rating = request.Rating;
        entry.Caption = request.Caption;
        entry.PhotoUrl = request.PhotoUrl;
        entry.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        entry.Restaurant = restaurant;
        return MapToResponse(entry);
    }

    public async Task<bool> DeleteAsync(Guid id, Guid userId, CancellationToken cancellationToken)
    {
        var entry = await _context.Entries
            .FirstOrDefaultAsync(e => e.Id == id && e.UserId == userId, cancellationToken);

        if (entry is null) return false;

        var photoUrl = entry.PhotoUrl;
        _context.Entries.Remove(entry);
        await _context.SaveChangesAsync(cancellationToken);
        await _photoService.DeleteAsync(photoUrl);

        return true;
    }

    private static EntryResponse MapToResponse(Entry e) => new()
    {
        Id = e.Id,
        VisitedAt = e.VisitedAt,
        Rating = e.Rating,
        Caption = e.Caption,
        PhotoUrl = e.PhotoUrl,
        CreatedAt = e.CreatedAt,
        UpdatedAt = e.UpdatedAt,
        Restaurant = e.Restaurant == null ? null : new EntryRestaurantResponse
        {
            Id = e.Restaurant.Id,
            Name = e.Restaurant.Name,
            Address = e.Restaurant.Address,
            Barangay = e.Restaurant.Barangay,
            City = e.Restaurant.City,
            Province = e.Restaurant.Province,
            Category = e.Restaurant.Category,
        }
    };
}
