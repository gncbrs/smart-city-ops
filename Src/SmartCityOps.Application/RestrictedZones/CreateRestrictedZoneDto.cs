namespace SmartCityOps.Application.RestrictedZones;

public record CreateRestrictedZoneDto(
    string Name,
    string Description,
    double Latitude,
    double Longitude,
    double RadiusMeters,
    string ZoneType
);
