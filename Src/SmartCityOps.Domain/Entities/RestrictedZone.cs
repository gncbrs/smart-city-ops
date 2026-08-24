using SmartCityOps.Domain.Common;
using SmartCityOps.Domain.Enums;

namespace SmartCityOps.Domain.Entities;

public class RestrictedZone : EntityBase
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public double RadiusMeters { get; set; }
    public RestrictedZoneType ZoneType { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public bool IsActive { get; set; }
}
