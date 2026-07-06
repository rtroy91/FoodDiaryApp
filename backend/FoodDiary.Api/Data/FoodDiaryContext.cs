using FoodDiary.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace FoodDiary.Api.Data;

public class FoodDiaryContext : DbContext
{
    public FoodDiaryContext(DbContextOptions<FoodDiaryContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Restaurant> Restaurants => Set<Restaurant>();
    public DbSet<Entry> Entries => Set<Entry>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Users
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        // Restaurants
        modelBuilder.Entity<Restaurant>()
            .HasIndex(r => r.UserId);

        modelBuilder.Entity<Restaurant>()
            .HasMany(r => r.Entries)
            .WithOne(e => e.Restaurant)
            .HasForeignKey(e => e.RestaurantId)
            .OnDelete(DeleteBehavior.Cascade);

        // Entries
        modelBuilder.Entity<Entry>()
            .HasIndex(e => e.UserId);

        modelBuilder.Entity<Entry>()
            .HasIndex(e => e.RestaurantId);
    }
}
