using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SmartCityOps.Domain.Entities;
using SmartCityOps.Domain.Enums;

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

        builder.HasData(
            new RestrictedZone
            {
                Id = Guid.Parse("d1111111-1111-1111-1111-111111111111"),
                Name = "Kızılay Security Zone",
                Description = "Government district security perimeter - police access only",
                ZoneType = RestrictedZoneType.SecurityLockdown,
                Latitude = 39.9208,
                Longitude = 32.8541,
                RadiusMeters = 600,
                IsActive = true,
                CreatedAt = new DateTimeOffset(2026, 8, 1, 0, 0, 0, TimeSpan.Zero)
            },
            new RestrictedZone
            {
                Id = Guid.Parse("d2222222-2222-2222-2222-222222222222"),
                Name = "Eskişehir Road Construction",
                Description = "Main arterial infrastructure & road maintenance",
                ZoneType = RestrictedZoneType.RoadConstruction,
                Latitude = 39.9080,
                Longitude = 32.7650,
                RadiusMeters = 800,
                IsActive = true,
                CreatedAt = new DateTimeOffset(2026, 8, 1, 0, 0, 0, TimeSpan.Zero)
            }
        );
    }
}
