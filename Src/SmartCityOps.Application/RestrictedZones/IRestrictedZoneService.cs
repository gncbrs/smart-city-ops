using SmartCityOps.Domain.Entities;

namespace SmartCityOps.Application.RestrictedZones;

public interface IRestrictedZoneService
{
    Task<IReadOnlyList<RestrictedZoneDto>> GetAllAsync(CancellationToken cancellationToken);
    Task<RestrictedZoneDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<RestrictedZoneDto> CreateAsync(CreateRestrictedZoneDto dto, CancellationToken cancellationToken);
    Task<RestrictedZoneDto> UpdateAsync(Guid id, UpdateRestrictedZoneDto dto, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<RestrictedZone>> GetActiveZonesAsync(CancellationToken cancellationToken);
}
