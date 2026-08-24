using SmartCityOps.Application.Common.DomainEvents;

namespace SmartCityOps.Application.Incidents.Events;

public record IncidentCreatedEvent(Guid IncidentId) : IDomainEvent;
