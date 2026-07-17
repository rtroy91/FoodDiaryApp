using FoodDiary.Api.Data;
using FoodDiary.Api.DTOs.Requests;
using FoodDiary.Api.DTOs.Responses;
using FoodDiary.Api.Interfaces;
using FoodDiary.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace FoodDiary.Api.Services;

// Rule: Used a C# 12 Primary Constructor to eliminate boilerplate dependency injection fields
public class EntryService(FoodDiaryContext context, IPhotoService photoService) : IEntryService
{
    public async Task<List<EntryListResponse>> GetAllAsync(Guid userId, Guid? restaurantId, CancellationToken cancellationToken)
    {
        var query = context.Entries
            .AsNoTracking()
            .Where(e => e.UserId == userId);

        if (restaurantId.HasValue)
            query = query.Where(e => e.RestaurantId == restaurantId.Value);

        return await query
            .OrderByDescending(e => e.VisitedAt)
            .Select(e => new EntryListResponse
            {
                Id = e.Id,
                VisitedAt = e.VisitedAt,
                Rating = e.Rating,
                Caption = e.Caption,
                PhotoUrl = e.PhotoUrl,
                CreatedAt = e.CreatedAt,
                UpdatedAt = e.UpdatedAt,
                Restaurant = e.Restaurant == null ? null : new EntryListRestaurantResponse
                {
                    Id = e.Restaurant.Id,
                    Name = e.Restaurant.Name,
                    Barangay = e.Restaurant.Barangay,
                    City = e.Restaurant.City,
                    Province = e.Restaurant.Province,
                    Category = e.Restaurant.Category,
                    StorePhotoUrl = e.Restaurant.StorePhotoUrl
                }
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<List<EntryListResponse>> GetRecentEntriesAsync(Guid userId, int limit, CancellationToken cancellationToken)
    {
        return await context.Entries
            .AsNoTracking()
            .Where(e => e.UserId == userId)
            .OrderByDescending(e => e.VisitedAt)
            .Take(limit)
            .Select(e => new EntryListResponse
            {
                Id = e.Id,
                VisitedAt = e.VisitedAt,
                Rating = e.Rating,
                Caption = e.Caption,
                PhotoUrl = e.PhotoUrl,
                CreatedAt = e.CreatedAt,
                UpdatedAt = e.UpdatedAt,
                Restaurant = e.Restaurant == null ? null : new EntryListRestaurantResponse
                {
                    Id = e.Restaurant.Id,
                    Name = e.Restaurant.Name,
                    Barangay = e.Restaurant.Barangay,
                    City = e.Restaurant.City,
                    Province = e.Restaurant.Province,
                    Category = e.Restaurant.Category,
                    StorePhotoUrl = e.Restaurant.StorePhotoUrl
                }
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<EntryListResponse?> GetByIdAsync(Guid id, Guid userId, CancellationToken cancellationToken)
    {
        return await context.Entries
            .AsNoTracking()
            .Where(e => e.Id == id && e.UserId == userId)
            .Select(e => new EntryListResponse
            {
                Id = e.Id,
                VisitedAt = e.VisitedAt,
                Rating = e.Rating,
                Caption = e.Caption,
                PhotoUrl = e.PhotoUrl,
                CreatedAt = e.CreatedAt,
                UpdatedAt = e.UpdatedAt,
                Restaurant = e.Restaurant == null ? null : new EntryListRestaurantResponse
                {
                    Id = e.Restaurant.Id,
                    Name = e.Restaurant.Name,
                    Barangay = e.Restaurant.Barangay,
                    City = e.Restaurant.City,
                    Province = e.Restaurant.Province,
                    Category = e.Restaurant.Category,
                    StorePhotoUrl = e.Restaurant.StorePhotoUrl
                }
            })
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<EntryListResponse> CreateAsync(Guid userId, CreateEntryRequest request, CancellationToken cancellationToken)
    {
        var restaurant = await context.Restaurants
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

        context.Entries.Add(entry);
        await context.SaveChangesAsync(cancellationToken);

        entry.Restaurant = restaurant;
        return MapToListResponse(entry);
    }

    public async Task<EntryListResponse?> UpdateAsync(Guid id, Guid userId, UpdateEntryRequest request, CancellationToken cancellationToken)
    {
        var entry = await context.Entries
            .FirstOrDefaultAsync(e => e.Id == id && e.UserId == userId, cancellationToken);

        if (entry is null) return null;

        var restaurant = await context.Restaurants
            .AsNoTracking()
            .FirstOrDefaultAsync(r => r.Id == request.RestaurantId, cancellationToken)
            ?? throw new KeyNotFoundException("Restaurant not found.");

        entry.RestaurantId = request.RestaurantId;
        entry.VisitedAt = request.VisitedAt;
        entry.Rating = request.Rating;
        entry.Caption = request.Caption;
        entry.PhotoUrl = request.PhotoUrl;
        entry.UpdatedAt = DateTime.UtcNow;

        await context.SaveChangesAsync(cancellationToken);

        entry.Restaurant = restaurant;
        return MapToListResponse(entry);
    }

    public async Task<bool> DeleteAsync(Guid id, Guid userId, CancellationToken cancellationToken)
    {
        var entry = await context.Entries
            .FirstOrDefaultAsync(e => e.Id == id && e.UserId == userId, cancellationToken);

        if (entry is null) return false;

        var photoUrl = entry.PhotoUrl;
        context.Entries.Remove(entry);
        await context.SaveChangesAsync(cancellationToken);
        
        await photoService.DeleteAsync(photoUrl);

        return true;
    }

    private static EntryListResponse MapToListResponse(Entry e) => new()
    {
        Id = e.Id,
        VisitedAt = e.VisitedAt,
        Rating = e.Rating,
        Caption = e.Caption,
        PhotoUrl = e.PhotoUrl,
        CreatedAt = e.CreatedAt,
        UpdatedAt = e.UpdatedAt,
        Restaurant = e.Restaurant == null ? null : new EntryListRestaurantResponse
        {
            Id = e.Restaurant.Id,
            Name = e.Restaurant.Name,
            Barangay = e.Restaurant.Barangay,
            City = e.Restaurant.City,
            Province = e.Restaurant.Province,
            Category = e.Restaurant.Category,
            StorePhotoUrl = e.Restaurant.StorePhotoUrl
        }
    };
}
