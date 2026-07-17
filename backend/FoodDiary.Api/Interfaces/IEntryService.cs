using FoodDiary.Api.DTOs.Requests;
using FoodDiary.Api.DTOs.Responses;

namespace FoodDiary.Api.Interfaces;

public interface IEntryService
{
    Task<List<EntryListResponse>> GetAllAsync(Guid userId, Guid? restaurantId, CancellationToken cancellationToken);
    Task<List<EntryListResponse>> GetRecentEntriesAsync(Guid userId, int limit, CancellationToken cancellationToken);
    Task<EntryListResponse?> GetByIdAsync(Guid id, Guid userId, CancellationToken cancellationToken);
    Task<EntryListResponse> CreateAsync(Guid userId, CreateEntryRequest request, CancellationToken cancellationToken);
    Task<EntryListResponse?> UpdateAsync(Guid id, Guid userId, UpdateEntryRequest request, CancellationToken cancellationToken);
    Task<bool> DeleteAsync(Guid id, Guid userId, CancellationToken cancellationToken);
}
