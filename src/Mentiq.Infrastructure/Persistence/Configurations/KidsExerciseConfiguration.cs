using Mentiq.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Mentiq.Infrastructure.Persistence.Configurations;

public sealed class ExerciseAttemptConfiguration : IEntityTypeConfiguration<ExerciseAttempt>
{
    public void Configure(EntityTypeBuilder<ExerciseAttempt> builder)
    {
        builder.ToTable("ExerciseAttempts");
        builder.HasKey(a => a.Id);

        builder.HasIndex(a => new { a.UserId, a.Skill });
        builder.HasIndex(a => new { a.UserId, a.CreatedAtUtc });

        builder.Property(a => a.Skill).IsRequired().HasMaxLength(32);
        builder.Property(a => a.ExerciseType).IsRequired().HasMaxLength(32);
        builder.Property(a => a.World).HasMaxLength(32);
        builder.Property(a => a.CorrectAnswer).HasMaxLength(64);
        builder.Property(a => a.GivenAnswer).HasMaxLength(64);
    }
}

public sealed class SkillProgressConfiguration : IEntityTypeConfiguration<SkillProgress>
{
    public void Configure(EntityTypeBuilder<SkillProgress> builder)
    {
        builder.ToTable("SkillProgress");
        builder.HasKey(p => p.Id);

        builder.HasIndex(p => new { p.UserId, p.Skill }).IsUnique();

        builder.Property(p => p.Skill).IsRequired().HasMaxLength(32);
    }
}
