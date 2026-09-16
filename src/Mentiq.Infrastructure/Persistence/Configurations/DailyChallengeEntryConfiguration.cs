using Mentiq.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Mentiq.Infrastructure.Persistence.Configurations;

public sealed class DailyChallengeEntryConfiguration : IEntityTypeConfiguration<DailyChallengeEntry>
{
    public void Configure(EntityTypeBuilder<DailyChallengeEntry> builder)
    {
        builder.ToTable("DailyChallengeEntries");

        builder.HasKey(e => e.Id);

        // One entry per user per grade per challenge day (upserted to keep the best score).
        builder.HasIndex(e => new { e.ChallengeDate, e.Grade, e.UserId }).IsUnique();

        // Leaderboard lookups filter by day + grade and order by score.
        builder.HasIndex(e => new { e.ChallengeDate, e.Grade, e.Score });

        builder.Property(e => e.DisplayName).IsRequired().HasMaxLength(128);
    }
}
