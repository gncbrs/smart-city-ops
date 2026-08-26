using SmartCityOps.Application.OperationalZones;
using SmartCityOps.Domain.Common;

namespace SmartCityOps.Infrastructure.OperationalZones;

public class OperationalZoneService : IOperationalZoneService
{
    private static readonly IReadOnlyList<OperationalZoneDto> Zones = AnkaraOperationalZones.All
        .Select(zone => new OperationalZoneDto(zone.Name, zone.Latitude, zone.Longitude, zone.Spread, zone.Weight))
        .ToList();

    public Task<IReadOnlyList<OperationalZoneDto>> GetAllAsync(CancellationToken cancellationToken)
    {
        return Task.FromResult(Zones);
    }
}
