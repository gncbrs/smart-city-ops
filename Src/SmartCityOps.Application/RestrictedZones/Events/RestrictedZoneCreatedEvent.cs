using SmartCityOps.Application.Common.DomainEvents;

namespace SmartCityOps.Application.RestrictedZones.Events;

public record RestrictedZoneCreatedEvent(Guid RestrictedZoneId) : IDomainEvent;
