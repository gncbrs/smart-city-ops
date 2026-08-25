using Microsoft.EntityFrameworkCore;
using SmartCityOps.Application.Common.DomainEvents;
using SmartCityOps.Application.RestrictedZones;
using SmartCityOps.Application.RestrictedZones.Events;
using SmartCityOps.Domain.Entities;
using SmartCityOps.Domain.Enums;
using SmartCityOps.Infrastructure.Persistence;

namespace SmartCityOps.Infrastructure.RestrictedZones;

public class RestrictedZoneService : IRestrictedZoneService
{
    private readonly ApplicationDbContext _dbContext;
    private readonly IDomainEventDispatcher _domainEventDispatcher;

    public RestrictedZoneService(ApplicationDbContext dbContext, IDomainEventDispatcher domainEventDispatcher)
    {
        _dbContext = dbContext;
        _domainEventDispatcher = domainEventDispatcher;
    }

    public async Task<IReadOnlyList<RestrictedZoneDto>> GetAllAsync(CancellationToken cancellationToken)
    {
        return await _dbContext.RestrictedZones
            .AsNoTracking()
            .Select(z => new RestrictedZoneDto(
                z.Id,
                z.Name,
                z.Description,
                z.Latitude,
                z.Longitude,
                z.RadiusMeters,
                z.ZoneType.ToString(),
                z.CreatedAt,
                z.IsActive))
            .ToListAsync(cancellationToken);
    }

    public async Task<RestrictedZoneDto> CreateAsync(CreateRestrictedZoneDto dto, CancellationToken cancellationToken)
    {
        var zone = new RestrictedZone
        {
            Id = Guid.NewGuid(),
            Name = dto.Name,
            Description = dto.Description,
            Latitude = dto.Latitude,
            Longitude = dto.Longitude,
            RadiusMeters = dto.RadiusMeters,
            ZoneType = Enum.Parse<RestrictedZoneType>(dto.ZoneType),
            CreatedAt = DateTimeOffset.UtcNow,
            IsActive = true
        };

        _dbContext.RestrictedZones.Add(zone);
        await _dbContext.SaveChangesAsync(cancellationToken);
        await _domainEventDispatcher.DispatchAsync(new RestrictedZoneCreatedEvent(zone.Id), cancellationToken);

        return ToDto(zone);
    }

    public async Task<RestrictedZoneDto> UpdateAsync(Guid id, UpdateRestrictedZoneDto dto, CancellationToken cancellationToken = default)
    {
        var zone = await _dbContext.RestrictedZones
            .FirstOrDefaultAsync(z => z.Id == id, cancellationToken)
            ?? throw new KeyNotFoundException("Kısıtlı bölge bulunamadı.");

        zone.Name = dto.Name;
        zone.Description = dto.Description;
        zone.Latitude = dto.Latitude;
        zone.Longitude = dto.Longitude;
        zone.RadiusMeters = dto.RadiusMeters;
        zone.ZoneType = Enum.Parse<RestrictedZoneType>(dto.ZoneType);
        zone.IsActive = dto.IsActive;

        await _dbContext.SaveChangesAsync(cancellationToken);
        await _domainEventDispatcher.DispatchAsync(new RestrictedZoneUpdatedEvent(zone.Id), cancellationToken);

        return ToDto(zone);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var zone = await _dbContext.RestrictedZones
            .FirstOrDefaultAsync(z => z.Id == id, cancellationToken)
            ?? throw new KeyNotFoundException("Kısıtlı bölge bulunamadı.");

        _dbContext.RestrictedZones.Remove(zone);
        await _dbContext.SaveChangesAsync(cancellationToken);
        await _domainEventDispatcher.DispatchAsync(new RestrictedZoneDeletedEvent(id), cancellationToken);
    }

    public async Task<IReadOnlyList<RestrictedZone>> GetActiveZonesAsync(CancellationToken cancellationToken)
    {
        return await _dbContext.RestrictedZones
            .AsNoTracking()
            .Where(z => z.IsActive)
            .ToListAsync(cancellationToken);
    }

    private static RestrictedZoneDto ToDto(RestrictedZone zone) =>
        new(
            zone.Id,
            zone.Name,
            zone.Description,
            zone.Latitude,
            zone.Longitude,
            zone.RadiusMeters,
            zone.ZoneType.ToString(),
            zone.CreatedAt,
            zone.IsActive);
}
