using SmartCityOps.Application.Common.DomainEvents;

namespace SmartCityOps.Application.OperationalTasks.Events;

public record TaskCancelledEvent(Guid TaskId, Guid IncidentId, Guid FieldUnitId) : IDomainEvent;
