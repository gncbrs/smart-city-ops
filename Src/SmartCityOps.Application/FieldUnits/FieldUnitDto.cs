namespace SmartCityOps.Application.FieldUnits;

public record FieldUnitDto(
    Guid Id,
    string UnitCode,
    string Type,
    string Status,
    double Latitude,
    double Longitude
);
