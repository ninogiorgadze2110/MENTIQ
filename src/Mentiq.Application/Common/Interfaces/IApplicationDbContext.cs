using Mentiq.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Mentiq.Application.Common.Interfaces;

/// <summary>
/// Abstraction over the persistence context so application use cases do not
/// depend on the concrete EF Core DbContext in the Infrastructure project.
/// </summary>
public interface IApplicationDbContext
{
    DbSet<User> Users { get; }

    DbSet<PracticeSession> PracticeSessions { get; }

    DbSet<Competition> Competitions { get; }

    DbSet<CompetitionEntry> CompetitionEntries { get; }

    DbSet<UserAchievement> UserAchievements { get; }

    DbSet<Subscription> Subscriptions { get; }

    DbSet<SubscriptionHistory> SubscriptionHistory { get; }

    DbSet<DailyChallengeEntry> DailyChallengeEntries { get; }

    DbSet<ContactMessage> ContactMessages { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);

    /// <summary>Returns whether the underlying database is reachable.</summary>
    Task<bool> CanConnectAsync(CancellationToken cancellationToken = default);
}
