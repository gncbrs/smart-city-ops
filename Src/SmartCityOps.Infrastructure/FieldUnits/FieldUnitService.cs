using Microsoft.EntityFrameworkCore;
using SmartCityOps.Application.Common.DomainEvents;
using SmartCityOps.Application.FieldUnits;
using SmartCityOps.Application.FieldUnits.Events;
using SmartCityOps.Domain.Entities;
using SmartCityOps.Domain.Enums;
using SmartCityOps.Domain.Exceptions;
using SmartCityOps.Infrastructure.Persistence;

namespace SmartCityOps.Infrastructure.FieldUnits;

public class FieldUnitService : IFieldUnitService
{
    private readonly ApplicationDbContext _dbContext;
    private readonly IDomainEventDispatcher _domainEventDispatcher;

    public FieldUnitService(ApplicationDbContext dbContext, IDomainEventDispatcher domainEventDispatcher)
    {
        _dbContext = dbContext;
        _domainEventDispatcher = domainEventDispatcher;
    }

    public async Task<IReadOnlyList<FieldUnitDto>> GetAllAsync(CancellationToken cancellationToken)
    {
        return await _dbContext.FieldUnits
            .AsNoTracking() //sadece okuma için hiçbir şey güncellenmeyecek.
            .Select(f => new FieldUnitDto(
                f.Id,
                f.UnitCode,
                f.Type.ToString(),
                f.Status.ToString(),
                f.Latitude,
                f.Longitude))
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<FieldUnitMovementRecordDto>> GetMovementHistoryAsync(Guid fieldUnitId, CancellationToken cancellationToken = default)
    {
        var exists = await _dbContext.FieldUnits
            .AsNoTracking()
            .AnyAsync(f => f.Id == fieldUnitId, cancellationToken);

        if (!exists)
        {
            throw new KeyNotFoundException("Field unit bulunamadı.");
        }

        var rawHistory = await (
            from lh in _dbContext.FieldUnitLocationHistories.AsNoTracking()
            where lh.FieldUnitId == fieldUnitId
            join inc in _dbContext.Incidents.AsNoTracking() on lh.IncidentId equals inc.Id into incJoin
            from inc in incJoin.DefaultIfEmpty()
            orderby lh.RecordedAt descending
            select new
            {
                lh.Id,
                lh.RecordedAt,
                lh.Latitude,
                lh.Longitude,
                lh.IncidentId,
                IncidentType = (IncidentType?)(inc == null ? null : inc.Type),
                inc.IncidentCode
            }
        ).ToListAsync(cancellationToken);

        return rawHistory
            .Select(r => new FieldUnitMovementRecordDto(
                r.Id,
                r.RecordedAt,
                r.Latitude,
                r.Longitude,
                r.IncidentId,
                r.IncidentType?.ToString(),
                r.IncidentCode
            ))
            .ToList();
    }

    public async Task<FieldUnitDto> UpdateStatusAsync(Guid id, UpdateFieldUnitStatusDto dto, CancellationToken cancellationToken = default)
    {
        var unit = await _dbContext.FieldUnits
            .FirstOrDefaultAsync(f => f.Id == id, cancellationToken)
            ?? throw new KeyNotFoundException("Field unit bulunamadı.");

        if (!Enum.TryParse<FieldUnitStatus>(dto.Status, true, out var targetStatus))
        {
            throw new ArgumentException("Geçersiz FieldUnitStatus değeri.");
        }

        if (unit.Status == FieldUnitStatus.Dispatched)
        {
            throw new DomainConflictException("Görevdeki bir birimin durumu doğrudan değiştirilemez.");
        }

        if (targetStatus == FieldUnitStatus.Dispatched)
        {
            throw new DomainConflictException("Dispatched durumu yalnızca görev ataması ile verilebilir.");
        }

        if (unit.Status != targetStatus)
        {
            unit.Status = targetStatus;

            _dbContext.FieldUnitStatusHistories.Add(
                new FieldUnitStatusHistory(Guid.NewGuid(), unit.Id, targetStatus, DateTimeOffset.UtcNow, dto.Reason));

            await _dbContext.SaveChangesAsync(cancellationToken);
            await _domainEventDispatcher.DispatchAsync(new FieldUnitUpdatedEvent(unit.Id), cancellationToken);
        }

        return ToDto(unit);
    }

    private static FieldUnitDto ToDto(FieldUnit fieldUnit) =>
        new(
            fieldUnit.Id,
            fieldUnit.UnitCode,
            fieldUnit.Type.ToString(),
            fieldUnit.Status.ToString(),
            fieldUnit.Latitude,
            fieldUnit.Longitude);
}