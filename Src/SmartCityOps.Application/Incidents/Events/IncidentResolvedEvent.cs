using SmartCityOps.Application.Common.DomainEvents;

namespace SmartCityOps.Application.Incidents.Events;

public record IncidentResolvedEvent(Guid IncidentId) : IDomainEvent;
