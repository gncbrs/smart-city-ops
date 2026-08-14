using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using SmartCityOps.Application.Incidents;
using SmartCityOps.Infrastructure.Incidents;
using SmartCityOps.Infrastructure.Persistence;
using SmartCityOps.Application.FieldUnits;
using SmartCityOps.Infrastructure.FieldUnits;
using SmartCityOps.Application.OperationalTasks;
using SmartCityOps.Infrastructure.OperationalTasks;

namespace SmartCityOps.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection");

        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseNpgsql(connectionString));

        services.AddScoped<IIncidentService, IncidentService>();
        services.AddScoped<IFieldUnitService, FieldUnitService>();
        services.AddScoped<IOperationalTaskService, OperationalTaskService>();

        return services;
    }
}