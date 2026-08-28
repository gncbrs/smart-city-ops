using Microsoft.EntityFrameworkCore;
using SmartCityOps.Domain.Entities;

namespace SmartCityOps.Infrastructure.Persistence;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<Incident> Incidents => Set<Incident>();
    public DbSet<FieldUnit> FieldUnits => Set<FieldUnit>();
    public DbSet<OperationalTask> OperationalTasks => Set<OperationalTask>();
    public DbSet<FieldUnitLocationHistory> FieldUnitLocationHistories => Set<FieldUnitLocationHistory>();
    public DbSet<RestrictedZone> RestrictedZones => Set<RestrictedZone>();
    public DbSet<FieldUnitStatusHistory> FieldUnitStatusHistories => Set<FieldUnitStatusHistory>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);
        base.OnModelCreating(modelBuilder);
    }
}