using FoodDiary.Api.Models;

namespace FoodDiary.Api.Interfaces;

public interface IJwtTokenService
{
    string Generate(User user);
}
