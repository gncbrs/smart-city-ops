using SmartCityOps.Application.Common.DomainEvents;

namespace SmartCityOps.Application.OperationalTasks.Events;

public record TaskReassignedEvent(Guid OldTaskId, Guid NewTaskId, Guid IncidentId, Guid OldFieldUnitId, Guid NewFieldUnitId) : IDomainEvent;
