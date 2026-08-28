namespace SmartCityOps.Application.Incidents;

public record IncidentTimelineEventDto(
    string Id,
    DateTimeOffset Timestamp,
    string Description,
    string? FieldUnitId = null
);
