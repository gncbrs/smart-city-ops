using SmartCityOps.Application.Common.DomainEvents;

namespace SmartCityOps.Application.RestrictedZones.Events;

public record RestrictedZoneUpdatedEvent(Guid RestrictedZoneId) : IDomainEvent;
