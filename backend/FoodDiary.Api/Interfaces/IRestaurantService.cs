using FoodDiary.Api.DTOs.Requests;
using FoodDiary.Api.DTOs.Responses;

namespace FoodDiary.Api.Interfaces;

public interface IRestaurantService
{
    Task<List<RestaurantResponse>> GetRestaurantListsAsync(CancellationToken cancellationToken);
    Task<List<RestaurantOptionResponse>> GetRestaurantOptionsAsync(CancellationToken cancellationToken);
    Task<IEnumerable<RestaurantResponse>> GetMostVisitedAsync(Guid userId, int limit, CancellationToken cancellationToken);
    Task<RestaurantResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken);
    Task<RestaurantResponse> CreateAsync(CreateRestaurantRequest request, CancellationToken cancellationToken);
    Task<RestaurantResponse?> UpdateAsync(Guid id, UpdateRestaurantRequest request, CancellationToken cancellationToken);
    Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken);
}
