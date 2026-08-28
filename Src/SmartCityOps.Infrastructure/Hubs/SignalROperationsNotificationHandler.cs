using Microsoft.AspNetCore.SignalR;
using SmartCityOps.Application.Common.DomainEvents;
using SmartCityOps.Application.FieldUnits.Events;
using SmartCityOps.Application.Incidents.Events;
using SmartCityOps.Application.OperationalTasks.Events;
using SmartCityOps.Application.RestrictedZones.Events;

namespace SmartCityOps.Infrastructure.Hubs;

public class SignalROperationsNotificationHandler :
    IDomainEventHandler<TaskAssignedEvent>,
    IDomainEventHandler<TaskCompletedEvent>,
    IDomainEventHandler<TaskReassignedEvent>,
    IDomainEventHandler<IncidentCreatedEvent>,
    IDomainEventHandler<IncidentResolvedEvent>,
    IDomainEventHandler<RestrictedZoneCreatedEvent>,
    IDomainEventHandler<RestrictedZoneUpdatedEvent>,
    IDomainEventHandler<RestrictedZoneDeletedEvent>,
    IDomainEventHandler<FieldUnitUpdatedEvent>
{
    private readonly IHubContext<OperationsHub> _hubContext;

    public SignalROperationsNotificationHandler(IHubContext<OperationsHub> hubContext)
    {
        _hubContext = hubContext;
    }

    public Task HandleAsync(TaskAssignedEvent domainEvent, CancellationToken cancellationToken) =>
        NotifyAsync(cancellationToken);

    public Task HandleAsync(TaskCompletedEvent domainEvent, CancellationToken cancellationToken) =>
        NotifyAsync(cancellationToken);

    public Task HandleAsync(TaskReassignedEvent domainEvent, CancellationToken cancellationToken) =>
        NotifyAsync(cancellationToken);

    public Task HandleAsync(IncidentCreatedEvent domainEvent, CancellationToken cancellationToken) =>
        NotifyAsync(cancellationToken);

    public Task HandleAsync(IncidentResolvedEvent domainEvent, CancellationToken cancellationToken) =>
        NotifyAsync(cancellationToken);

    public Task HandleAsync(RestrictedZoneCreatedEvent domainEvent, CancellationToken cancellationToken) =>
        NotifyAsync(cancellationToken);

    public Task HandleAsync(RestrictedZoneUpdatedEvent domainEvent, CancellationToken cancellationToken) =>
        NotifyAsync(cancellationToken);

    public Task HandleAsync(RestrictedZoneDeletedEvent domainEvent, CancellationToken cancellationToken) =>
        NotifyAsync(cancellationToken);

    public Task HandleAsync(FieldUnitUpdatedEvent domainEvent, CancellationToken cancellationToken) =>
        NotifyAsync(cancellationToken);

    private Task NotifyAsync(CancellationToken cancellationToken) =>
        _hubContext.Clients.All.SendAsync("OperationsUpdated", cancellationToken);
}
