using SmartCityOps.Application.Common.DomainEvents;

namespace SmartCityOps.Application.RestrictedZones.Events;

public record RestrictedZoneDeletedEvent(Guid RestrictedZoneId) : IDomainEvent;
