namespace SmartCityOps.Application.RestrictedZones;

public record RestrictedZoneDto(
    Guid Id,
    string Name,
    string Description,
    double Latitude,
    double Longitude,
    double RadiusMeters,
    string ZoneType,
    DateTimeOffset CreatedAt,
    bool IsActive
);
