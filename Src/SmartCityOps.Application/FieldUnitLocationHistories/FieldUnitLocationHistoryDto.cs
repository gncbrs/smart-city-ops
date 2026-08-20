namespace SmartCityOps.Application.FieldUnitLocationHistories;

public record FieldUnitLocationHistoryDto(
    Guid Id,
    Guid FieldUnitId,
    Guid? IncidentId,
    double Latitude,
    double Longitude,
    DateTimeOffset RecordedAt
);