namespace SmartCityOps.Application.OperationalZones;

public record OperationalZoneDto(
    string Name,
    double Latitude,
    double Longitude,
    double Spread,
    int Weight
);