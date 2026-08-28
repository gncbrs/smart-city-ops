namespace SmartCityOps.Application.FieldUnits;

public record FieldUnitMovementRecordDto(
    Guid Id,
    DateTimeOffset Timestamp,
    double Latitude,
    double Longitude,
    Guid? IncidentId,
    string? IncidentType,
    string? IncidentCode
);
