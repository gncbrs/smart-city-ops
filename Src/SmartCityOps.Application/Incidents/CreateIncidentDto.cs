namespace SmartCityOps.Application.Incidents;

public record CreateIncidentDto(
    string IncidentCode,
    string Type,
    string Priority,
    DateTimeOffset ReportedAt,
    double Latitude,
    double Longitude,
    string Description
);