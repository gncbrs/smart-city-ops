using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SmartCityOps.Domain.Entities;
using SmartCityOps.Domain.Enums;

namespace SmartCityOps.Infrastructure.Persistence.Configurations;

public class FieldUnitConfiguration : IEntityTypeConfiguration<FieldUnit>
{
    public void Configure(EntityTypeBuilder<FieldUnit> builder)
    {
        builder.ToTable("FieldUnits");

        builder.HasKey(f => f.Id);

        builder.Property(f => f.UnitCode)
            .IsRequired()
            .HasMaxLength(50);

        builder.HasIndex(f => f.UnitCode)
            .IsUnique();

        builder.Property(f => f.Type)
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(f => f.Status)
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.HasData(
            new FieldUnit
            {
                Id = Guid.Parse("b9599661-cb85-422a-ae1e-3596a0be4976"),
                UnitCode = "POL-01",
                Type = FieldUnitType.Police,
                Status = FieldUnitStatus.Available,
                Latitude = 39.925,
                Longitude = 32.836
            },
            new FieldUnit
            {
                Id = Guid.Parse("2ac082fc-7044-4b45-8404-f018d6209477"),
                UnitCode = "MED-01",
                Type = FieldUnitType.Medical,
                Status = FieldUnitStatus.Available,
                Latitude = 39.93,
                Longitude = 32.85
            },
            new FieldUnit
            {
                Id = Guid.Parse("145eeb0d-ef83-41bd-994b-083e5a6c92d1"),
                UnitCode = "FIR-01",
                Type = FieldUnitType.Fire,
                Status = FieldUnitStatus.Dispatched,
                Latitude = 39.915,
                Longitude = 32.82
            },
            new FieldUnit
            {
                Id = Guid.Parse("d5dd3221-bd61-417c-9350-8bd21b732f9b"),
                UnitCode = "UTL-01",
                Type = FieldUnitType.UtilityCrew,
                Status = FieldUnitStatus.Available,
                Latitude = 39.94,
                Longitude = 32.86
            },
            new FieldUnit
            {
                Id = Guid.Parse("cc32593c-0ab6-4c24-aaea-f6bb9ab2de95"),
                UnitCode = "TRF-01",
                Type = FieldUnitType.TrafficControl,
                Status = FieldUnitStatus.OutOfService,
                Latitude = 39.905,
                Longitude = 32.81
            }
        );
    }
}