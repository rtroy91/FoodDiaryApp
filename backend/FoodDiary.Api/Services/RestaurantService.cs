using FoodDiary.Api.Data;
using FoodDiary.Api.DTOs.Requests;
using FoodDiary.Api.DTOs.Responses;
using FoodDiary.Api.Interfaces;
using FoodDiary.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace FoodDiary.Api.Services;

public class RestaurantService : IRestaurantService
{
    private readonly FoodDiaryContext _context;

    public RestaurantService(FoodDiaryContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<RestaurantResponse>> GetAllAsync(Guid userId)
    {
        return await _context.Restaurants
            .Where(r => r.UserId == userId)
            .Select(r => MapToResponse(r))
            .ToListAsync();
    }

    // public async Task<IEnumerable<RestaurantResponse>> GetNearbyAsync(
    //     Guid userId, double lat, double lng, double radiusKm)
    // {
    //     // Load into memory first — fine at personal-diary scale;
    //     // swap to PostGIS ST_DWithin if scale ever demands it.
    //     var all = await _context.Restaurants
    //         .Where(r => r.UserId == userId)
    //         .Include(r => r.Entries)
    //         .ToListAsync();

    //     return all
    //         .Where(r => GeoHelper.DistanceKm(lat, lng, r.Latitude, r.Longitude) <= radiusKm)
    //         .OrderBy(r => GeoHelper.DistanceKm(lat, lng, r.Latitude, r.Longitude))
    //         .Select(r => MapToResponse(r));
    // }

    public async Task<IEnumerable<RestaurantResponse>> GetMostVisitedAsync(Guid userId, int limit)
    {
        return await _context.Restaurants
            .Where(r => r.UserId == userId)
            .Include(r => r.Entries)
            .OrderByDescending(r => r.Entries.Count)
            .Take(limit)
            .Select(r => MapToResponse(r))
            .ToListAsync();
    }

    public async Task<RestaurantResponse?> GetByIdAsync(Guid id, Guid userId)
    {
        var restaurant = await _context.Restaurants
            .Include(r => r.Entries)
            .FirstOrDefaultAsync(r => r.Id == id && r.UserId == userId);

        return restaurant is null ? null : MapToResponse(restaurant);
    }

    public async Task<RestaurantResponse> CreateAsync(Guid userId, CreateRestaurantRequest request)
    {
        var restaurant = new Restaurant
        {
            UserId = userId,
            Name = request.Name,
            Address = request.Address,
            Barangay = request.Barangay,
            City = request.City,
            Province = request.Province,
            Category = request.Category,
            // Latitude = request.Latitude,
            // Longitude = request.Longitude
        };

        _context.Restaurants.Add(restaurant);
        await _context.SaveChangesAsync();

        return MapToResponse(restaurant);
    }

    public async Task<RestaurantResponse?> UpdateAsync(Guid id, Guid userId, UpdateRestaurantRequest request)
    {
        var restaurant = await _context.Restaurants
            .Include(r => r.Entries)
            .FirstOrDefaultAsync(r => r.Id == id && r.UserId == userId);

        if (restaurant is null) return null;

        restaurant.Name = request.Name;
        restaurant.Address = request.Address;
        restaurant.Barangay = request.Barangay;
        restaurant.City = request.City;
        restaurant.Province = request.Province;
        restaurant.Category = request.Category;
        // restaurant.Latitude = request.Latitude;
        // restaurant.Longitude = request.Longitude;

        await _context.SaveChangesAsync();

        return MapToResponse(restaurant);
    }

    public async Task<bool> DeleteAsync(Guid id, Guid userId)
    {
        var restaurant = await _context.Restaurants
            .FirstOrDefaultAsync(r => r.Id == id && r.UserId == userId);

        if (restaurant is null) return false;

        _context.Restaurants.Remove(restaurant);
        await _context.SaveChangesAsync();
        return true;
    }

    // ── Mapping ───────────────────────────────────────────────────────────

    private static RestaurantResponse MapToResponse(Restaurant r) => new()
    {
        Id = r.Id,
        Name = r.Name,
        Address = r.Address,
        Barangay = r.Barangay,
        City = r.City,
        Province = r.Province,
        Category = r.Category,
        // Latitude = r.Latitude,
        // Longitude = r.Longitude,
        VisitCount = r.Entries.Count,
        AverageRating = r.Entries.Count > 0 ? r.Entries.Average(e => e.Rating) : null,
        CreatedAt = r.CreatedAt
    };
}
