using SmartCityOps.Domain.Entities;

namespace SmartCityOps.Application.RestrictedZones;

public interface IRestrictedZoneService
{
    Task<IReadOnlyList<RestrictedZoneDto>> GetAllAsync(CancellationToken cancellationToken);
    Task<RestrictedZoneDto> CreateAsync(CreateRestrictedZoneDto dto, CancellationToken cancellationToken);
    Task<IReadOnlyList<RestrictedZone>> GetActiveZonesAsync(CancellationToken cancellationToken);
}
