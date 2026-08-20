using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SmartCityOps.Domain.Entities;

namespace SmartCityOps.Infrastructure.Persistence.Configurations;

public class FieldUnitLocationHistoryConfiguration : IEntityTypeConfiguration<FieldUnitLocationHistory>
{
    public void Configure(EntityTypeBuilder<FieldUnitLocationHistory> builder)
    {
        builder.ToTable("FieldUnitLocationHistories");

        builder.HasKey(h => h.Id);

        builder.HasIndex(h => h.FieldUnitId);

        builder.HasOne<FieldUnit>()
            .WithMany()
            .HasForeignKey(h => h.FieldUnitId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne<Incident>()
            .WithMany()
            .HasForeignKey(h => h.IncidentId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}