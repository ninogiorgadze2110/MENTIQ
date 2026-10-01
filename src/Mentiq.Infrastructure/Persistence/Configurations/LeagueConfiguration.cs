using Mentiq.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Mentiq.Infrastructure.Persistence.Configurations;

public sealed class LeagueConfiguration : IEntityTypeConfiguration<League>
{
    public void Configure(EntityTypeBuilder<League> builder)
    {
        builder.ToTable("Leagues");
        builder.HasKey(l => l.Id);
        // One league per grade + tier + week.
        builder.HasIndex(l => new { l.Grade, l.Tier, l.WeekStartUtc }).IsUnique();
        builder.HasIndex(l => new { l.Closed, l.WeekEndUtc });
    }
}

public sealed class LeagueEntryConfiguration : IEntityTypeConfiguration<LeagueEntry>
{
    public void Configure(EntityTypeBuilder<LeagueEntry> builder)
    {
        builder.ToTable("LeagueEntries");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.DisplayName).HasMaxLength(128);

        // One membership per user per league.
        builder.HasIndex(e => new { e.LeagueId, e.UserId }).IsUnique();

        builder.HasOne<League>()
            .WithMany()
            .HasForeignKey(e => e.LeagueId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public sealed class UserLeagueStandingConfiguration : IEntityTypeConfiguration<UserLeagueStanding>
{
    public void Configure(EntityTypeBuilder<UserLeagueStanding> builder)
    {
        builder.ToTable("UserLeagueStandings");
        builder.HasKey(s => s.Id);
        builder.HasIndex(s => s.UserId).IsUnique();
    }
}
