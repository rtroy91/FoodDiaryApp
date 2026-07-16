using FoodDiary.Api.Data;
using FoodDiary.Api.Interfaces;
using FoodDiary.Api.Services;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.EntityFrameworkCore;

namespace FoodDiary.Api.Extensions;

public static class ServiceCollectionExtensions
{
    /// <summary>
    /// Registers all application services.
    /// Controllers depend only on interfaces; this is the single place that wires them up.
    /// </summary>
    public static IServiceCollection AddApplicationServices(
        this IServiceCollection services,
        IConfiguration config)
    {
        // Database
        services.AddDbContext<FoodDiaryContext>(options =>
            options.UseNpgsql(config.GetConnectionString("DefaultConnection")));

        // Interface to service bindings (Dependency Injection)
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IJwtTokenService, JwtTokenService>();
        services.AddScoped<IRestaurantService, RestaurantService>();
        services.AddScoped<IEntryService, EntryService>();
        services.AddScoped<IPhotoService, PhotoService>();
        services.AddScoped<IUserService, UserService>();
        services.AddDataProtection();
        services.AddHttpClient();
        services.AddHttpClient<IEmailService, ResendEmailService>();

        return services;
    }
}
