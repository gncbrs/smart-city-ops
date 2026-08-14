using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SmartCityOps.Domain.Entities;

namespace SmartCityOps.Infrastructure.Persistence.Configurations;

public class OperationalTaskConfiguration : IEntityTypeConfiguration<OperationalTask>
{
    public void Configure(EntityTypeBuilder<OperationalTask> builder)
    {
        builder.ToTable("OperationalTasks");

        builder.HasKey(t => t.Id);

        builder.Property(t => t.Status)
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.HasIndex(t => t.IncidentId);
        builder.HasIndex(t => t.FieldUnitId);

        builder.HasOne<Incident>()
            .WithMany()
            .HasForeignKey(t => t.IncidentId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne<FieldUnit>()
            .WithMany()
            .HasForeignKey(t => t.FieldUnitId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}