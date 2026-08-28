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

        var incidentIdsWithActiveTasksAt = tasksAssignedByThen
            .Where(t => IsTaskActiveAt(t, timestamp))
            .Select(t => t.IncidentId)
            .ToHashSet();

        var incidentDtos = incidents
            .Select(i =>
            {
                var resolvedAt = i.ResolvedAt.HasValue && i.ResolvedAt <= timestamp ? i.ResolvedAt : null;

                return new IncidentDto(
                    i.Id,
                    i.Type.ToString(),
                    i.Priority.ToString(),
                    ResolveIncidentStatusAt(i, tasksByIncident.GetValueOrDefault(i.Id), timestamp),
                    i.ReportedAt,
                    i.Latitude,
                    i.Longitude,
                    i.Description,
                    resolvedAt,
                    IncidentPriorityScoreCalculator.Calculate(i.Priority, i.ReportedAt, timestamp),
                    resolvedAt is null && !incidentIdsWithActiveTasksAt.Contains(i.Id));
            })
            .ToList();

        var fieldUnits = await _dbContext.FieldUnits.AsNoTracking().ToListAsync(cancellationToken);
        var fieldUnitIds = fieldUnits.Select(f => f.Id).ToList();

        var fieldUnitIdsWithActiveTaskAt = tasksAssignedByThen
            .Where(t => IsTaskActiveAt(t, timestamp))
            .Select(t => t.FieldUnitId)
            .ToHashSet();

        var locationsAtOrBefore = await _dbContext.FieldUnitLocationHistories
            .AsNoTracking()
            .Where(h => h.RecordedAt <= timestamp && fieldUnitIds.Contains(h.FieldUnitId))
            .ToListAsync(cancellationToken);

        var latestLocationByFieldUnit = locationsAtOrBefore
            .GroupBy(h => h.FieldUnitId)
            .ToDictionary(g => g.Key, g => g.OrderByDescending(h => h.RecordedAt).First());

        var statusHistoriesAtOrBefore = await _dbContext.FieldUnitStatusHistories
            .AsNoTracking()
            .Where(h => h.ChangedAt <= timestamp)
            .OrderBy(h => h.ChangedAt)
            .ToListAsync(cancellationToken);

        var latestStatusHistoryByFieldUnit = statusHistoriesAtOrBefore
            .GroupBy(h => h.FieldUnitId)
            .ToDictionary(g => g.Key, g => g.Last());

        var fieldUnitDtos = fieldUnits
            .Select(f => BuildFieldUnitReplayDto(
                f,
                fieldUnitIdsWithActiveTaskAt.Contains(f.Id),
                latestStatusHistoryByFieldUnit.GetValueOrDefault(f.Id),
                latestLocationByFieldUnit.GetValueOrDefault(f.Id)))
            .ToList();

        var activeTaskDtos = tasksAssignedByThen
            .Where(t => IsTaskActiveAt(t, timestamp))
            .Select(t => new OperationalTaskDto(
                t.Id,
                t.IncidentId,
                t.FieldUnitId,
                OperationalTaskStatus.Assigned.ToString(),
                t.AssignedAt,
                null,
                t.ReassignedAt,
                t.OriginLatitude,
                t.OriginLongitude,
                t.EstimatedEtaSeconds,
                t.RouteGeometry))
            .ToList();

        return new OperationsSnapshotDto(timestamp, incidentDtos, fieldUnitDtos, activeTaskDtos);
    }

    public async Task<ReplayTimeRangeDto> GetReplayTimeRangeAsync(CancellationToken cancellationToken)
    {
        // One round trip per table instead of one per column: each query aggregates every
        // min/max it needs from that table in a single SQL statement (GROUP BY on a constant key
        // computes a single-row aggregate, no per-row data is fetched).
        var incidentRange = await _dbContext.Incidents
            .GroupBy(_ => 1)
            .Select(g => new
            {
                MinReportedAt = g.Min(i => (DateTimeOffset?)i.ReportedAt),
                MaxReportedAt = g.Max(i => (DateTimeOffset?)i.ReportedAt),
                MaxResolvedAt = g.Max(i => i.ResolvedAt)
            })
            .SingleOrDefaultAsync(cancellationToken);

        var locationRange = await _dbContext.FieldUnitLocationHistories
            .GroupBy(_ => 1)
            .Select(g => new
            {
                MinRecordedAt = g.Min(h => (DateTimeOffset?)h.RecordedAt),
                MaxRecordedAt = g.Max(h => (DateTimeOffset?)h.RecordedAt)
            })
            .SingleOrDefaultAsync(cancellationToken);

        var taskRange = await _dbContext.OperationalTasks
            .GroupBy(_ => 1)
            .Select(g => new
            {
                MinAssignedAt = g.Min(t => (DateTimeOffset?)t.AssignedAt),
                MaxAssignedAt = g.Max(t => (DateTimeOffset?)t.AssignedAt),
                MaxCompletedAt = g.Max(t => t.CompletedAt),
                MaxReassignedAt = g.Max(t => t.ReassignedAt)
            })
            .SingleOrDefaultAsync(cancellationToken);

        var minTimestamp = new[]
        {
            incidentRange?.MinReportedAt,
            locationRange?.MinRecordedAt,
            taskRange?.MinAssignedAt
        }.Min();

        var maxTimestamp = new[]
        {
            incidentRange?.MaxReportedAt,
            incidentRange?.MaxResolvedAt,
            locationRange?.MaxRecordedAt,
            taskRange?.MaxAssignedAt,
            taskRange?.MaxCompletedAt,
            taskRange?.MaxReassignedAt
        }.Max();

        return new ReplayTimeRangeDto(minTimestamp, maxTimestamp);
    }

    private static bool IsTaskActiveAt(OperationalTask task, DateTimeOffset timestamp) =>
        task.Status == OperationalTaskStatus.Reassigned
            ? task.AssignedAt <= timestamp && (!task.ReassignedAt.HasValue || task.ReassignedAt.Value > timestamp)
            : task.CompletedAt is null || task.CompletedAt > timestamp;

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

    private static FieldUnitReplayDto BuildFieldUnitReplayDto(
        FieldUnit fieldUnit,
        bool hasActiveTaskAtTimestamp,
        FieldUnitStatusHistory? latestStatusHistoryAtOrBefore,
        FieldUnitLocationHistory? latestLocationAtOrBefore)
    {
        var latitude = latestLocationAtOrBefore?.Latitude ?? fieldUnit.Latitude;
        var longitude = latestLocationAtOrBefore?.Longitude ?? fieldUnit.Longitude;

        var status = hasActiveTaskAtTimestamp
            ? FieldUnitStatus.Dispatched
            : latestStatusHistoryAtOrBefore?.Status ?? FieldUnitStatus.Available;

        return new FieldUnitReplayDto(
            fieldUnit.Id,
            fieldUnit.UnitCode,
            fieldUnit.Type.ToString(),
            status.ToString(),
            latitude,
            longitude);
    }
}
