using FoodDiary.Api.DTOs.Requests;
using FoodDiary.Api.DTOs.Responses;

namespace FoodDiary.Api.Interfaces;

public interface IEntryService
{
    Task<IEnumerable<EntryResponse>> GetAllAsync(Guid userId, Guid? restaurantId, CancellationToken cancellationToken);
    Task<List<EntryResponse>> GetRecentEntriesAsync(Guid userId, int limit, CancellationToken cancellationToken);
    Task<EntryResponse?> GetByIdAsync(Guid id, Guid userId, CancellationToken cancellationToken);
    Task<EntryResponse> CreateAsync(Guid userId, CreateEntryRequest request, CancellationToken cancellationToken);
    Task<EntryResponse?> UpdateAsync(Guid id, Guid userId, UpdateEntryRequest request, CancellationToken cancellationToken);
    Task<bool> DeleteAsync(Guid id, Guid userId, CancellationToken cancellationToken);
}
