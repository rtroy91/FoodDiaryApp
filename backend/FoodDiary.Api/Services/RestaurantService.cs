using FoodDiary.Api.Data;
using FoodDiary.Api.DTOs.Requests;
using FoodDiary.Api.DTOs.Responses;
using FoodDiary.Api.Interfaces;
using FoodDiary.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace FoodDiary.Api.Services;

public class RestaurantService(FoodDiaryContext db, IPhotoService photoService) : IRestaurantService
{
    public async Task<List<RestaurantResponse>> GetRestaurantListsAsync(CancellationToken cancellationToken)
    {
        return await db.Restaurants
            .AsNoTracking()
            .OrderBy(r => r.Name)
            .Select(r => new RestaurantResponse
            {
                Id = r.Id,
                Name = r.Name,
                Address = r.Address,
                Barangay = r.Barangay,
                City = r.City,
                Province = r.Province,
                Category = r.Category,
                MenuPhotoUrl = r.MenuPhotoUrl,
                StorePhotoUrl = r.StorePhotoUrl,
                Promo = r.Promo,
                OpeningHours = r.OpeningHours
                    .OrderBy(h => h.Day)
                    .Select(h => new RestaurantOpeningHourResponse
                    {
                        Day = h.Day,
                        Open = h.Open,
                        Close = h.Close
                    })
                    .ToList(),
                Budget = r.Budget,
                Latitude = r.Latitude,
                Longitude = r.Longitude
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<List<RestaurantOptionResponse>> GetRestaurantOptionsAsync(CancellationToken cancellationToken)
    {
        return await db.Restaurants
            .AsNoTracking()
            .OrderBy(r => r.Name)
            .Select(r => new RestaurantOptionResponse
            {
                Id = r.Id,
                Name = r.Name
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<RestaurantResponse>> GetMostVisitedAsync(
        Guid userId,
        int limit,
        CancellationToken cancellationToken)
    {
        return await db.Restaurants
            .AsNoTracking()
            .Where(r => r.Entries.Any(e => e.UserId == userId))
            .OrderByDescending(r => r.Entries.Count(e => e.UserId == userId))
            .Take(limit)
            .Select(r => new RestaurantResponse
            {
                Id = r.Id,
                Name = r.Name,
                Address = r.Address,
                Barangay = r.Barangay,
                City = r.City,
                Province = r.Province,
                Category = r.Category,
                MenuPhotoUrl = r.MenuPhotoUrl,
                StorePhotoUrl = r.StorePhotoUrl,
                Promo = r.Promo,
                OpeningHours = r.OpeningHours
                    .OrderBy(h => h.Day)
                    .Select(h => new RestaurantOpeningHourResponse
                    {
                        Day = h.Day,
                        Open = h.Open,
                        Close = h.Close
                    })
                    .ToList(),
                Budget = r.Budget,
                Latitude = r.Latitude,
                Longitude = r.Longitude
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<RestaurantResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        return await db.Restaurants
            .AsNoTracking()
            .Where(r => r.Id == id)
            .Select(r => new RestaurantResponse
            {
                Id = r.Id,
                Name = r.Name,
                Address = r.Address,
                Barangay = r.Barangay,
                City = r.City,
                Province = r.Province,
                Category = r.Category,
                MenuPhotoUrl = r.MenuPhotoUrl,
                StorePhotoUrl = r.StorePhotoUrl,
                Promo = r.Promo,
                OpeningHours = r.OpeningHours
                    .OrderBy(h => h.Day)
                    .Select(h => new RestaurantOpeningHourResponse
                    {
                        Day = h.Day,
                        Open = h.Open,
                        Close = h.Close
                    })
                    .ToList(),
                Budget = r.Budget,
                Latitude = r.Latitude,
                Longitude = r.Longitude
            })
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<RestaurantResponse> CreateAsync(CreateRestaurantRequest request, CancellationToken cancellationToken)
    {
        var restaurant = new Restaurant
        {
            Name = request.Name,
            Address = request.Address,
            Barangay = request.Barangay,
            City = request.City,
            Province = request.Province,
            Category = request.Category,
            MenuPhotoUrl = request.MenuPhotoUrl,
            StorePhotoUrl = request.StorePhotoUrl,
            Promo = request.Promo,
            OpeningHours = MapOpeningHours(request.OpeningHours),
            Budget = request.Budget,
            Latitude = request.Latitude,
            Longitude = request.Longitude
        };

        db.Restaurants.Add(restaurant);
        await db.SaveChangesAsync(cancellationToken);

        return MapToResponse(restaurant);
    }

    public async Task<RestaurantResponse?> UpdateAsync(
        Guid id,
        UpdateRestaurantRequest request,
        CancellationToken cancellationToken)
    {
        var restaurant = await db.Restaurants
            .Include(r => r.OpeningHours)
            .FirstOrDefaultAsync(r => r.Id == id, cancellationToken);

        if (restaurant is null) return null;

        restaurant.Name = request.Name;
        restaurant.Address = request.Address;
        restaurant.Barangay = request.Barangay;
        restaurant.City = request.City;
        restaurant.Province = request.Province;
        restaurant.Category = request.Category;
        restaurant.MenuPhotoUrl = request.MenuPhotoUrl;
        restaurant.StorePhotoUrl = request.StorePhotoUrl;
        restaurant.Promo = request.Promo;
        restaurant.Budget = request.Budget;
        restaurant.Latitude = request.Latitude;
        restaurant.Longitude = request.Longitude;
        restaurant.OpeningHours.Clear();
        restaurant.OpeningHours.AddRange(MapOpeningHours(request.OpeningHours));

        await db.SaveChangesAsync(cancellationToken);

        return MapToResponse(restaurant);
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken)
    {
        var restaurant = await db.Restaurants
            .Include(r => r.Entries)
            .FirstOrDefaultAsync(r => r.Id == id, cancellationToken);

        if (restaurant is null) return false;

        var photoUrls = new[] { restaurant.MenuPhotoUrl, restaurant.StorePhotoUrl }
            .Concat(restaurant.Entries.Select(e => e.PhotoUrl))
            .Where(url => !string.IsNullOrWhiteSpace(url))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();

        db.Restaurants.Remove(restaurant);
        await db.SaveChangesAsync(cancellationToken);

        foreach (var photoUrl in photoUrls)
            await photoService.DeleteAsync(photoUrl);

        return true;
    }

    private static RestaurantResponse MapToResponse(Restaurant r) => new()
    {
        Id = r.Id,
        Name = r.Name,
        Address = r.Address,
        Barangay = r.Barangay,
        City = r.City,
        Province = r.Province,
        Category = r.Category,
        MenuPhotoUrl = r.MenuPhotoUrl,
        StorePhotoUrl = r.StorePhotoUrl,
        Promo = r.Promo,
        OpeningHours = r.OpeningHours
            .OrderBy(h => h.Day)
            .Select(h => new RestaurantOpeningHourResponse
            {
                Day = h.Day,
                Open = h.Open,
                Close = h.Close
            })
            .ToList(),
        Budget = r.Budget,
        Latitude = r.Latitude,
        Longitude = r.Longitude
    };

    private static List<RestaurantOpeningHour> MapOpeningHours(
        IEnumerable<RestaurantOpeningHourRequest> openingHours)
    {
        return openingHours
            .Where(h => h.Day is >= 1 and <= 7)
            .GroupBy(h => h.Day)
            .Select(group => group.First())
            .OrderBy(h => h.Day)
            .Select(h => new RestaurantOpeningHour
            {
                Day = h.Day,
                Open = string.IsNullOrWhiteSpace(h.Open) ? null : h.Open,
                Close = string.IsNullOrWhiteSpace(h.Close) ? null : h.Close
            })
            .ToList();
    }
}
