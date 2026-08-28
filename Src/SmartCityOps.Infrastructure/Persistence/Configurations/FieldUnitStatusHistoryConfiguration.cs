using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SmartCityOps.Domain.Entities;

namespace SmartCityOps.Infrastructure.Persistence.Configurations;

public class FieldUnitStatusHistoryConfiguration : IEntityTypeConfiguration<FieldUnitStatusHistory>
{
    public void Configure(EntityTypeBuilder<FieldUnitStatusHistory> builder)
    {
        builder.ToTable("FieldUnitStatusHistories");

        builder.HasKey(h => h.Id);

        builder.Property(h => h.Status)
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.HasIndex(h => new { h.FieldUnitId, h.ChangedAt });

        builder.HasOne<FieldUnit>()
            .WithMany()
            .HasForeignKey(h => h.FieldUnitId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
