using SmartCityOps.Application.Common.DomainEvents;

namespace SmartCityOps.Application.FieldUnits.Events;

public record FieldUnitUpdatedEvent(Guid FieldUnitId) : IDomainEvent;
