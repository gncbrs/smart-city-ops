using SmartCityOps.Application.Common.DomainEvents;

namespace SmartCityOps.Application.OperationalTasks.Events;

public record TaskCompletedEvent(Guid TaskId, Guid FieldUnitId) : IDomainEvent;
