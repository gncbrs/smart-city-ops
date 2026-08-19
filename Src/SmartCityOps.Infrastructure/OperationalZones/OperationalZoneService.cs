using SmartCityOps.Application.OperationalZones;

namespace SmartCityOps.Infrastructure.OperationalZones;

public class OperationalZoneService : IOperationalZoneService
{
    // Bu liste Src/incident-generator/Worker.cs içindeki AnkaraZones dizisiyle
    // birebir aynı tutulmalı - generator, backend'e referans vermediği için
    // (bkz. DEVELOPMENT_LOG'daki bilinçli decoupling kararı) bu veriyi paylaşamıyoruz,
    // elle senkron tutuyoruz. Worker.cs'de bir zon değişirse burası da güncellenmeli.
    private static readonly IReadOnlyList<OperationalZoneDto> Zones = new List<OperationalZoneDto>
    {
        new("Merkez (Çankaya)", 39.925, 32.836, 0.05, 30),
        new("Keçiören",         39.995, 32.865, 0.03, 12),
        new("Mamak",            39.930, 32.920, 0.03, 12),
        new("Etimesgut",        39.950, 32.670, 0.03, 12),
        new("Sincan",           39.970, 32.575, 0.03, 12),
        new("Gölbaşı",          39.790, 32.810, 0.03, 10),
        new("Pursaklar",        40.040, 32.895, 0.03, 8),
    };

    public Task<IReadOnlyList<OperationalZoneDto>> GetAllAsync(CancellationToken cancellationToken)
    {
        return Task.FromResult(Zones);
    }
}