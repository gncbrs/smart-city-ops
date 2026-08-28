using Microsoft.EntityFrameworkCore;
using SmartCityOps.Application.FieldUnitLocationHistories;
using SmartCityOps.Infrastructure.FieldUnitLocationHistories;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using SmartCityOps.Application.Incidents;
using SmartCityOps.Infrastructure.Incidents;
using SmartCityOps.Infrastructure.Persistence;
using SmartCityOps.Application.FieldUnits;
using SmartCityOps.Infrastructure.FieldUnits;
using SmartCityOps.Application.OperationalTasks;
using SmartCityOps.Infrastructure.OperationalTasks;
using SmartCityOps.Application.OperationalTasks.AssignmentRules;
using SmartCityOps.Infrastructure.OperationalTasks.AssignmentRules;
using SmartCityOps.Application.OperationalZones;
using SmartCityOps.Infrastructure.OperationalZones;
using SmartCityOps.Application.Common.DomainEvents;
using SmartCityOps.Infrastructure.Common.DomainEvents;
using SmartCityOps.Application.Incidents.Events;
using SmartCityOps.Application.OperationalTasks.Events;
using SmartCityOps.Infrastructure.Hubs;
using SmartCityOps.Application.FieldUnitRecommendations;
using SmartCityOps.Infrastructure.FieldUnitRecommendations;
using SmartCityOps.Infrastructure.FieldUnitRecommendations.ScoringRules;
using SmartCityOps.Application.RestrictedZones;
using SmartCityOps.Infrastructure.RestrictedZones;
using SmartCityOps.Application.RestrictedZones.Events;
using SmartCityOps.Application.OperationsReplay;
using SmartCityOps.Infrastructure.OperationsReplay;
using SmartCityOps.Application.Common.Routing;
using SmartCityOps.Infrastructure.Common.Routing;

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
        services.AddScoped<IRestrictedZoneService, RestrictedZoneService>();
        services.AddScoped<ITaskAssignmentRule, FieldUnitAvailabilityRule>();
        services.AddScoped<ITaskAssignmentRule, IncidentNotResolvedRule>();
        services.AddScoped<ITaskAssignmentRule, RestrictedZoneAssignmentRule>();
        services.AddScoped<ITaskAssignmentRulePipeline, TaskAssignmentRulePipeline>();
        services.AddScoped<IOperationalTaskService, OperationalTaskService>();
        services.AddScoped<IOperationalZoneService, OperationalZoneService>();
        services.AddScoped<IFieldUnitLocationHistoryService, FieldUnitLocationHistoryService>();
        services.AddScoped<IOperationsReplayService, OperationsReplayService>();

        services.AddHttpClient<IRoutingService, OsrmRoutingService>(client =>
        {
            client.Timeout = TimeSpan.FromSeconds(3);
            client.DefaultRequestHeaders.UserAgent.ParseAdd("SmartCityOps-OperationsCenter/1.0");
        });

        services.AddScoped<IEtaEstimator, HaversineEtaEstimator>();
        services.AddScoped<IFieldUnitScoringRule, DistanceScoreRule>();
        services.AddScoped<IFieldUnitScoringRule, UnitTypeMatchScoreRule>();
        services.AddScoped<IFieldUnitScoringRule, AvailabilityScoreRule>();
        services.AddScoped<IFieldUnitRecommendationService, FieldUnitRecommendationService>();

        services.AddScoped<IDomainEventDispatcher, DomainEventDispatcher>();
        services.AddScoped<IDomainEventHandler<TaskAssignedEvent>, SignalROperationsNotificationHandler>();
        services.AddScoped<IDomainEventHandler<TaskCompletedEvent>, SignalROperationsNotificationHandler>();
        services.AddScoped<IDomainEventHandler<TaskReassignedEvent>, SignalROperationsNotificationHandler>();
        services.AddScoped<IDomainEventHandler<IncidentCreatedEvent>, SignalROperationsNotificationHandler>();
        services.AddScoped<IDomainEventHandler<IncidentResolvedEvent>, SignalROperationsNotificationHandler>();
        services.AddScoped<IDomainEventHandler<RestrictedZoneCreatedEvent>, SignalROperationsNotificationHandler>();
        services.AddScoped<IDomainEventHandler<RestrictedZoneUpdatedEvent>, SignalROperationsNotificationHandler>();
        services.AddScoped<IDomainEventHandler<RestrictedZoneDeletedEvent>, SignalROperationsNotificationHandler>();

        return services;
    }
}