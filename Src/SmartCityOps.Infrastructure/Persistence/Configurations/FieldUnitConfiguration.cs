using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SmartCityOps.Domain.Entities;

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
    }
}