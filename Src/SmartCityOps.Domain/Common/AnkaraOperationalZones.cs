namespace SmartCityOps.Domain.Common;

public record OperationalZoneDefinition(string Name, double Latitude, double Longitude, double Spread, int Weight);

public static class AnkaraOperationalZones
{
    public static readonly IReadOnlyList<OperationalZoneDefinition> All = new OperationalZoneDefinition[]
    {
        new("Merkez (Çankaya)", 39.925, 32.836, 0.05, 30),
        new("Keçiören",         39.995, 32.865, 0.03, 12),
        new("Mamak",            39.930, 32.920, 0.03, 12),
        new("Etimesgut",        39.950, 32.670, 0.03, 12),
        new("Sincan",           39.970, 32.575, 0.03, 12),
        new("Gölbaşı",          39.790, 32.810, 0.03, 10),
        new("Pursaklar",        40.040, 32.895, 0.03, 8),
    };
}
