using Mentiq.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Mentiq.Infrastructure.Persistence.Configurations;

public sealed class ContactMessageConfiguration : IEntityTypeConfiguration<ContactMessage>
{
    public void Configure(EntityTypeBuilder<ContactMessage> builder)
    {
        builder.ToTable("ContactMessages");

        builder.HasKey(m => m.Id);

        builder.Property(m => m.Comment).IsRequired().HasMaxLength(2000);
        builder.Property(m => m.Email).HasMaxLength(256);
        builder.Property(m => m.Name).HasMaxLength(128);

        builder.HasIndex(m => m.CreatedAtUtc);
    }
}
