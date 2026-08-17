namespace SmartCityOps.Application.Incidents;

public record IncidentDto(
    Guid Id,
    string Type,
    string Priority,
    string Status,
    DateTimeOffset ReportedAt,
    double Latitude,
    double Longitude,
    string Description,
    DateTimeOffset? ResolvedAt
);