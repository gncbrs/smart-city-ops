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
        new("Yenimahalle",      39.970, 32.795, 0.035, 12),
        new("Altındağ (Ulus/Dışkapı)", 39.955, 32.865, 0.030, 12),
        new("Polatlı",          39.585, 32.145, 0.040, 6),
        new("Elmadağ",          39.920, 33.230, 0.035, 6),
        new("Kahramankazan",    40.195, 32.685, 0.035, 6),
    };
}
