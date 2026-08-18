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
                Id = Guid.Parse("96f71bc3-185a-4148-b6e5-2a67daca36f5"),
                UnitCode = "POL-02",
                Type = FieldUnitType.Police,
                Status = FieldUnitStatus.Available,
                Latitude = 39.95,
                Longitude = 32.80
            },
            new FieldUnit
            {
                Id = Guid.Parse("fbeba342-a43c-40ed-9465-f50a4177ccf7"),
                UnitCode = "POL-03",
                Type = FieldUnitType.Police,
                Status = FieldUnitStatus.Available,
                Latitude = 39.90,
                Longitude = 32.90
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
                Id = Guid.Parse("6b68f2df-e043-48e2-a800-6f26bf4ed843"),
                UnitCode = "MED-02",
                Type = FieldUnitType.Medical,
                Status = FieldUnitStatus.Available,
                Latitude = 39.96,
                Longitude = 32.83
            },
            new FieldUnit
            {
                Id = Guid.Parse("4e2e9af5-cf12-4270-bfc3-f641cf3d815f"),
                UnitCode = "MED-03",
                Type = FieldUnitType.Medical,
                Status = FieldUnitStatus.Available,
                Latitude = 39.88,
                Longitude = 32.79
            },
            new FieldUnit
            {
                Id = Guid.Parse("145eeb0d-ef83-41bd-994b-083e5a6c92d1"),
                UnitCode = "FIR-01",
                Type = FieldUnitType.Fire,
                Status = FieldUnitStatus.Available,
                Latitude = 39.915,
                Longitude = 32.82
            },
            new FieldUnit
            {
                Id = Guid.Parse("833f2afc-9565-497d-8bb2-75403aab7127"),
                UnitCode = "FIR-02",
                Type = FieldUnitType.Fire,
                Status = FieldUnitStatus.Available,
                Latitude = 39.92,
                Longitude = 32.88
            },
            new FieldUnit
            {
                Id = Guid.Parse("5a6fcd12-2798-432c-81a6-416c00d5c30f"),
                UnitCode = "FIR-03",
                Type = FieldUnitType.Fire,
                Status = FieldUnitStatus.OutOfService,
                Latitude = 39.87,
                Longitude = 32.83
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
                Id = Guid.Parse("c05d230d-78b1-41ed-be18-c7936616b0ae"),
                UnitCode = "UTL-02",
                Type = FieldUnitType.UtilityCrew,
                Status = FieldUnitStatus.OutOfService,
                Latitude = 39.97,
                Longitude = 32.87
            },
            new FieldUnit
            {
                Id = Guid.Parse("12ad0bf6-b819-40e7-95d8-093ff4b9ac19"),
                UnitCode = "UTL-03",
                Type = FieldUnitType.UtilityCrew,
                Status = FieldUnitStatus.Available,
                Latitude = 39.91,
                Longitude = 32.79
            },
            new FieldUnit
            {
                Id = Guid.Parse("cc32593c-0ab6-4c24-aaea-f6bb9ab2de95"),
                UnitCode = "TRF-01",
                Type = FieldUnitType.TrafficControl,
                Status = FieldUnitStatus.OutOfService,
                Latitude = 39.905,
                Longitude = 32.81
            },
            new FieldUnit
            {
                Id = Guid.Parse("40adac57-adbc-42fb-b833-2ff44c976106"),
                UnitCode = "TRF-02",
                Type = FieldUnitType.TrafficControl,
                Status = FieldUnitStatus.Available,
                Latitude = 39.93,
                Longitude = 32.79
            },
            new FieldUnit
            {
                Id = Guid.Parse("115b0f76-4adf-4c9e-9d43-432b18143449"),
                UnitCode = "TRF-03",
                Type = FieldUnitType.TrafficControl,
                Status = FieldUnitStatus.Available,
                Latitude = 39.89,
                Longitude = 32.87
            }
        );
    }
}