using FoodDiary.Api.Data;
using FoodDiary.Api.Interfaces;
using FoodDiary.Api.Services;
using Microsoft.EntityFrameworkCore;

namespace FoodDiary.Api.Extensions;

public static class ServiceCollectionExtensions
{
    /// <summary>
    /// Registers all application services (Interface → Implementation bindings).
    /// Controllers depend only on interfaces; this is the single place that wires them up.
    /// </summary>
    public static IServiceCollection AddApplicationServices(
        this IServiceCollection services,
        IConfiguration config)
    {
        // Database
        services.AddDbContext<FoodDiaryContext>(options =>
            options.UseNpgsql(config.GetConnectionString("DefaultConnection")));

        // Interface → Service bindings (Dependency Injection)
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IRestaurantService, RestaurantService>();
        services.AddScoped<IEntryService, EntryService>();
        services.AddScoped<IPhotoService, PhotoService>();
        services.AddScoped<IUserService, UserService>();

        return services;
    }
}
