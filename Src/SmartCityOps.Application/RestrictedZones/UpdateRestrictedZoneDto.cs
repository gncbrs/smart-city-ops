namespace SmartCityOps.Application.RestrictedZones;

public record UpdateRestrictedZoneDto(
    string Name,
    string Description,
    double Latitude,
    double Longitude,
    double RadiusMeters,
    string ZoneType,
    bool IsActive
);
