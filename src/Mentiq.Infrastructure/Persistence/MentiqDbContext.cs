using Mentiq.Application.Common.Interfaces;
using Mentiq.Domain.Common;
using Mentiq.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Mentiq.Infrastructure.Persistence;

public sealed class MentiqDbContext : DbContext, IApplicationDbContext
{
    public MentiqDbContext(DbContextOptions<MentiqDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();

    public DbSet<PracticeSession> PracticeSessions => Set<PracticeSession>();

    public DbSet<Competition> Competitions => Set<Competition>();

    public DbSet<CompetitionEntry> CompetitionEntries => Set<CompetitionEntry>();

    public DbSet<UserAchievement> UserAchievements => Set<UserAchievement>();

    public DbSet<Subscription> Subscriptions => Set<Subscription>();

    public DbSet<SubscriptionHistory> SubscriptionHistory => Set<SubscriptionHistory>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Apply every IEntityTypeConfiguration in this assembly.
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(MentiqDbContext).Assembly);
    }

    public Task<bool> CanConnectAsync(CancellationToken cancellationToken = default)
        => Database.CanConnectAsync(cancellationToken);

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        foreach (var entry in ChangeTracker.Entries<BaseEntity>())
        {
            if (entry.State == EntityState.Modified)
            {
                entry.Entity.UpdatedAtUtc = DateTime.UtcNow;
            }
        }

        return base.SaveChangesAsync(cancellationToken);
    }
}
