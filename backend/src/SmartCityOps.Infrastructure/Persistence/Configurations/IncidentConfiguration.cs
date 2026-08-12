using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SmartCityOps.Domain.Entities;

namespace SmartCityOps.Infrastructure.Persistence.Configurations;

public class IncidentConfiguration : IEntityTypeConfiguration<Incident>
{
    public void Configure(EntityTypeBuilder<Incident> builder)
    {
        builder.ToTable("Incidents");

        builder.HasKey(i => i.Id);

        builder.Property(i => i.IncidentCode)
            .IsRequired()
            .HasMaxLength(50);

        builder.HasIndex(i => i.IncidentCode)
            .IsUnique();

        builder.Property(i => i.Type)
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(i => i.Priority)
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(i => i.Status)
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(i => i.Description)
            .IsRequired();
    }
}
