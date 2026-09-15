using Mentiq.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Mentiq.Infrastructure.Persistence.Configurations;

public sealed class CompetitionConfiguration : IEntityTypeConfiguration<Competition>
{
    public void Configure(EntityTypeBuilder<Competition> builder)
    {
        builder.ToTable("Competitions");
        builder.HasKey(c => c.Id);
        builder.Property(c => c.Title).IsRequired().HasMaxLength(128);
        builder.Property(c => c.CreatedByName).HasMaxLength(128);
        builder.HasIndex(c => new { c.Grade, c.EndsAtUtc });
    }
}

public sealed class CompetitionEntryConfiguration : IEntityTypeConfiguration<CompetitionEntry>
{
    public void Configure(EntityTypeBuilder<CompetitionEntry> builder)
    {
        builder.ToTable("CompetitionEntries");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.DisplayName).HasMaxLength(128);

        // One attempt per user per competition.
        builder.HasIndex(e => new { e.CompetitionId, e.UserId }).IsUnique();

        builder.HasOne<Competition>()
            .WithMany()
            .HasForeignKey(e => e.CompetitionId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
