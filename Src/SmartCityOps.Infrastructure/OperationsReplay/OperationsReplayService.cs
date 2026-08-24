using Microsoft.EntityFrameworkCore;
using SmartCityOps.Application.Incidents;
using SmartCityOps.Application.OperationalTasks;
using SmartCityOps.Application.OperationsReplay;
using SmartCityOps.Domain.Entities;
using SmartCityOps.Domain.Enums;
using SmartCityOps.Infrastructure.Persistence;

namespace SmartCityOps.Infrastructure.OperationsReplay;

public class OperationsReplayService : IOperationsReplayService
{
    private readonly ApplicationDbContext _dbContext;

    public OperationsReplayService(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<OperationsSnapshotDto> GetSnapshotAtAsync(DateTimeOffset timestamp, CancellationToken cancellationToken)
    {
        var incidents = await _dbContext.Incidents
            .AsNoTracking()
            .Where(i => i.ReportedAt <= timestamp)
            .ToListAsync(cancellationToken);

        var tasksAssignedByThen = await _dbContext.OperationalTasks
            .AsNoTracking()
            .Where(t => t.AssignedAt <= timestamp)
            .ToListAsync(cancellationToken);

        var tasksByIncident = tasksAssignedByThen
            .GroupBy(t => t.IncidentId)
            .ToDictionary(g => g.Key, g => g.Count());

        var incidentDtos = incidents
            .Select(i => new IncidentDto(
                i.Id,
                i.Type.ToString(),
                i.Priority.ToString(),
                ResolveIncidentStatusAt(i, tasksByIncident.GetValueOrDefault(i.Id), timestamp),
                i.ReportedAt,
                i.Latitude,
                i.Longitude,
                i.Description,
                i.ResolvedAt.HasValue && i.ResolvedAt <= timestamp ? i.ResolvedAt : null))
            .ToList();

        var fieldUnits = await _dbContext.FieldUnits.AsNoTracking().ToListAsync(cancellationToken);
        var fieldUnitIds = fieldUnits.Select(f => f.Id).ToList();

        var latestTaskByFieldUnit = tasksAssignedByThen
            .GroupBy(t => t.FieldUnitId)
            .ToDictionary(g => g.Key, g => g.OrderByDescending(t => t.AssignedAt).First());

        var locationsAtOrBefore = await _dbContext.FieldUnitLocationHistories
            .AsNoTracking()
            .Where(h => h.RecordedAt <= timestamp && fieldUnitIds.Contains(h.FieldUnitId))
            .ToListAsync(cancellationToken);

        var latestLocationByFieldUnit = locationsAtOrBefore
            .GroupBy(h => h.FieldUnitId)
            .ToDictionary(g => g.Key, g => g.OrderByDescending(h => h.RecordedAt).First());

        var fieldUnitDtos = fieldUnits
            .Select(f => BuildFieldUnitReplayDto(
                f,
                latestTaskByFieldUnit.GetValueOrDefault(f.Id),
                latestLocationByFieldUnit.GetValueOrDefault(f.Id),
                timestamp))
            .ToList();

        var activeTaskDtos = tasksAssignedByThen
            .Where(t => t.Status != OperationalTaskStatus.Reassigned && (t.CompletedAt is null || t.CompletedAt > timestamp))
            .Select(t => new OperationalTaskDto(
                t.Id,
                t.IncidentId,
                t.FieldUnitId,
                OperationalTaskStatus.Assigned.ToString(),
                t.AssignedAt,
                null,
                t.OriginLatitude,
                t.OriginLongitude,
                t.EstimatedEtaSeconds))
            .ToList();

        return new OperationsSnapshotDto(timestamp, incidentDtos, fieldUnitDtos, activeTaskDtos);
    }

    public async Task<ReplayTimeRangeDto> GetReplayTimeRangeAsync(CancellationToken cancellationToken)
    {
        var candidateMins = new List<DateTimeOffset?>
        {
            await _dbContext.Incidents.Select(i => (DateTimeOffset?)i.ReportedAt).MinAsync(cancellationToken),
            await _dbContext.FieldUnitLocationHistories.Select(h => (DateTimeOffset?)h.RecordedAt).MinAsync(cancellationToken),
            await _dbContext.OperationalTasks.Select(t => (DateTimeOffset?)t.AssignedAt).MinAsync(cancellationToken)
        };

        var candidateMaxes = new List<DateTimeOffset?>
        {
            await _dbContext.Incidents.Select(i => (DateTimeOffset?)i.ReportedAt).MaxAsync(cancellationToken),
            await _dbContext.Incidents.Select(i => i.ResolvedAt).MaxAsync(cancellationToken),
            await _dbContext.FieldUnitLocationHistories.Select(h => (DateTimeOffset?)h.RecordedAt).MaxAsync(cancellationToken),
            await _dbContext.OperationalTasks.Select(t => (DateTimeOffset?)t.AssignedAt).MaxAsync(cancellationToken),
            await _dbContext.OperationalTasks.Select(t => t.CompletedAt).MaxAsync(cancellationToken)
        };

        return new ReplayTimeRangeDto(candidateMins.Min(), candidateMaxes.Max());
    }

    private static string ResolveIncidentStatusAt(Incident incident, int tasksAssignedByThenCount, DateTimeOffset timestamp)
    {
        if (incident.ResolvedAt.HasValue && incident.ResolvedAt <= timestamp)
        {
            return IncidentStatus.Resolved.ToString();
        }

        return tasksAssignedByThenCount > 0
            ? IncidentStatus.InProgress.ToString()
            : IncidentStatus.Open.ToString();
    }

    // OutOfService is only ever set via seed data with no tracked transition event, so it is
    // treated as time-invariant here. A Reassigned task frees its old field unit immediately in
    // the live system, but that hand-off moment isn't persisted (the old task keeps no
    // CompletedAt), so a unit whose latest task was reassigned is approximated as Available for
    // any timestamp at/after that task's AssignedAt.
    private static FieldUnitReplayDto BuildFieldUnitReplayDto(
        FieldUnit fieldUnit,
        OperationalTask? latestTaskAtOrBefore,
        FieldUnitLocationHistory? latestLocationAtOrBefore,
        DateTimeOffset timestamp)
    {
        var latitude = latestLocationAtOrBefore?.Latitude ?? fieldUnit.Latitude;
        var longitude = latestLocationAtOrBefore?.Longitude ?? fieldUnit.Longitude;

        var status = fieldUnit.Status == FieldUnitStatus.OutOfService
            ? FieldUnitStatus.OutOfService
            : latestTaskAtOrBefore switch
            {
                null => FieldUnitStatus.Available,
                { Status: OperationalTaskStatus.Reassigned } => FieldUnitStatus.Available,
                { Status: OperationalTaskStatus.Completed, CompletedAt: not null } t when t.CompletedAt <= timestamp
                    => FieldUnitStatus.Available,
                _ => FieldUnitStatus.Dispatched
            };

        return new FieldUnitReplayDto(
            fieldUnit.Id,
            fieldUnit.UnitCode,
            fieldUnit.Type.ToString(),
            status.ToString(),
            latitude,
            longitude);
    }
}
