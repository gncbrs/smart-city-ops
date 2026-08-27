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
            .Where(t => t.Status == OperationalTaskStatus.Reassigned
                ? t.AssignedAt <= timestamp && (!t.ReassignedAt.HasValue || t.ReassignedAt.Value > timestamp)
                : t.CompletedAt is null || t.CompletedAt > timestamp)
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
                t.EstimatedEtaSeconds))
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
    // treated as time-invariant here.
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
                { Status: OperationalTaskStatus.Reassigned, ReassignedAt: not null } t when t.ReassignedAt <= timestamp
                    => FieldUnitStatus.Available,
                { Status: OperationalTaskStatus.Reassigned } => FieldUnitStatus.Dispatched,
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
