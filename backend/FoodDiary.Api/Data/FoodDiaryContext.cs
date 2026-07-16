using FoodDiary.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace FoodDiary.Api.Data;

public class FoodDiaryContext : DbContext
{
    public FoodDiaryContext(DbContextOptions<FoodDiaryContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<PasswordResetToken> PasswordResetTokens => Set<PasswordResetToken>();
    public DbSet<Restaurant> Restaurants => Set<Restaurant>();
    public DbSet<RestaurantOpeningHour> RestaurantOpeningHours => Set<RestaurantOpeningHour>();
    public DbSet<Entry> Entries => Set<Entry>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Users
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        modelBuilder.Entity<PasswordResetToken>()
            .HasIndex(t => t.TokenHash)
            .IsUnique();

        modelBuilder.Entity<PasswordResetToken>()
            .HasIndex(t => t.UserId);

        modelBuilder.Entity<PasswordResetToken>()
            .HasOne(t => t.User)
            .WithMany()
            .HasForeignKey(t => t.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // Restaurants
        modelBuilder.Entity<Restaurant>()
            .HasMany(r => r.Entries)
            .WithOne(e => e.Restaurant)
            .HasForeignKey(e => e.RestaurantId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Restaurant>()
            .HasMany(r => r.OpeningHours)
            .WithOne(h => h.Restaurant)
            .HasForeignKey(h => h.RestaurantId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<RestaurantOpeningHour>()
            .HasIndex(h => new { h.RestaurantId, h.Day })
            .IsUnique();

        // Entries
        modelBuilder.Entity<Entry>()
            .HasIndex(e => e.UserId);

        modelBuilder.Entity<Entry>()
            .HasIndex(e => e.RestaurantId);

        modelBuilder.Entity<Entry>()
            .Property(e => e.Rating)
            .HasPrecision(2, 1);
    }
}
