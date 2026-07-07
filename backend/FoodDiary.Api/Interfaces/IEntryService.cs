using FoodDiary.Api.DTOs.Requests;
using FoodDiary.Api.DTOs.Responses;

namespace FoodDiary.Api.Interfaces;

public interface IEntryService
{
    Task<IEnumerable<EntryResponse>> GetAllAsync(Guid userId, Guid? restaurantId);
    Task<List<EntryResponse>> GetRecentEntries(Guid userId, int limit);
    Task<EntryResponse?> GetByIdAsync(Guid id, Guid userId);
    Task<EntryResponse> CreateAsync(Guid userId, CreateEntryRequest request);
    Task<EntryResponse?> UpdateAsync(Guid id, Guid userId, UpdateEntryRequest request);
    Task<bool> DeleteAsync(Guid id, Guid userId);
}
