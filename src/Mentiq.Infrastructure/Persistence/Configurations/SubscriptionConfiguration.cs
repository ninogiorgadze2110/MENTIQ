using Mentiq.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Mentiq.Infrastructure.Persistence.Configurations;

public sealed class SubscriptionConfiguration : IEntityTypeConfiguration<Subscription>
{
    public void Configure(EntityTypeBuilder<Subscription> builder)
    {
        builder.ToTable("Subscriptions");

        builder.HasKey(s => s.Id);

        // One current subscription record per user.
        builder.HasIndex(s => s.UserId).IsUnique();

        builder.Property(s => s.Plan).IsRequired().HasMaxLength(64);

        builder.Property(s => s.Status)
            .IsRequired()
            .HasMaxLength(32)
            .HasConversion<string>();

        builder.Property(s => s.Provider).IsRequired().HasMaxLength(32);
        builder.Property(s => s.ProviderCustomerId).HasMaxLength(256);
        builder.Property(s => s.ProviderSubscriptionId).HasMaxLength(256);
        builder.Property(s => s.Notes).HasMaxLength(1024);
    }
}

public sealed class SubscriptionHistoryConfiguration : IEntityTypeConfiguration<SubscriptionHistory>
{
    public void Configure(EntityTypeBuilder<SubscriptionHistory> builder)
    {
        builder.ToTable("SubscriptionHistory");

        builder.HasKey(h => h.Id);

        builder.HasIndex(h => h.UserId);

        builder.Property(h => h.Action).IsRequired().HasMaxLength(32);
        builder.Property(h => h.Plan).IsRequired().HasMaxLength(64);

        builder.Property(h => h.Status)
            .IsRequired()
            .HasMaxLength(32)
            .HasConversion<string>();

        builder.Property(h => h.Provider).IsRequired().HasMaxLength(32);
        builder.Property(h => h.Notes).HasMaxLength(1024);
    }
}
