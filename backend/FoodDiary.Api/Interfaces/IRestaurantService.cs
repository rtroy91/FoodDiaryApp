using FoodDiary.Api.DTOs.Requests;
using FoodDiary.Api.DTOs.Responses;

namespace FoodDiary.Api.Interfaces;

public interface IRestaurantService
{
    Task<List<RestaurantResponse>> GetRestaurantLists();
    //Task<IEnumerable<RestaurantResponse>> GetNearbyAsync(Guid userId, double lat, double lng, double radiusKm);
    Task<IEnumerable<RestaurantResponse>> GetMostVisitedAsync(Guid userId, int limit);
    Task<RestaurantResponse?> GetByIdAsync(Guid id, Guid userId);
    Task<RestaurantResponse> CreateAsync(Guid userId, CreateRestaurantRequest request);
    Task<RestaurantResponse?> UpdateAsync(Guid id, Guid userId, UpdateRestaurantRequest request);
    Task<bool> DeleteAsync(Guid id, Guid userId);
}
