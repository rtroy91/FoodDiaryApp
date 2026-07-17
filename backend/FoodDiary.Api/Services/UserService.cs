using FoodDiary.Api.Data;
using FoodDiary.Api.DTOs.Responses;
using FoodDiary.Api.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace FoodDiary.Api.Services;

public class UserService(FoodDiaryContext context) : IUserService
{
    public async Task<IReadOnlyList<UserResponse>> GetAllAsync(CancellationToken cancellationToken)
    {
        return await context.Users
            .AsNoTracking()
            .OrderByDescending(user => user.CreatedAt)
            .Select(user => new UserResponse(user.Id, user.Email, user.DisplayName, user.Role, user.CreatedAt))
            .ToListAsync(cancellationToken);
    }
}
