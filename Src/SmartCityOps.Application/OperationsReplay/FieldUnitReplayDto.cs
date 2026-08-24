namespace SmartCityOps.Application.OperationsReplay;

public record FieldUnitReplayDto(
    Guid Id,
    string UnitCode,
    string Type,
    string Status,
    double Latitude,
    double Longitude
);
