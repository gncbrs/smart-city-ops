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

        // Bir field unit'in aynı anda birden fazla Assigned task'ta bulunmasını DB seviyesinde engeller
        // (iki operatörün aynı unit'i eş zamanlı ataması durumundaki race condition'a karşı).
        builder.HasIndex(t => t.FieldUnitId)
            .IsUnique()
            .HasFilter("\"Status\" = 'Assigned'")
            .HasDatabaseName("IX_OperationalTasks_FieldUnitId_ActiveAssignment");

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