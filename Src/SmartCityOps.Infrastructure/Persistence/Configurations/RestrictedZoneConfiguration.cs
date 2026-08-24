using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SmartCityOps.Domain.Entities;

namespace SmartCityOps.Infrastructure.Persistence.Configurations;

public class RestrictedZoneConfiguration : IEntityTypeConfiguration<RestrictedZone>
{
    public void Configure(EntityTypeBuilder<RestrictedZone> builder)
    {
        builder.ToTable("RestrictedZones");

        builder.HasKey(z => z.Id);

        builder.Property(z => z.Name)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(z => z.Description)
            .IsRequired();

        builder.Property(z => z.ZoneType)
            .HasConversion<string>()
            .HasMaxLength(30);

        builder.HasIndex(z => z.IsActive);
    }
}
