using Microsoft.EntityFrameworkCore;
using SmartCityOps.Application.Dashboard;
using SmartCityOps.Domain.Enums;
using SmartCityOps.Infrastructure.Persistence;

namespace SmartCityOps.Infrastructure.Dashboard;

public class OperationalStatisticsService : IOperationalStatisticsService
{
    private readonly ApplicationDbContext _dbContext;

    public OperationalStatisticsService(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<OperationalStatisticsDto> GetStatisticsAsync(CancellationToken cancellationToken = default)
    {
        var activeIncidentsCount = await _dbContext.Incidents
            .CountAsync(i => i.Status != IncidentStatus.Resolved, cancellationToken);

        var highPriorityActiveIncidentsCount = await _dbContext.Incidents
            .CountAsync(i => i.Status != IncidentStatus.Resolved && i.Priority == IncidentPriority.High, cancellationToken);

        var availableFieldUnitsCount = await _dbContext.FieldUnits
            .CountAsync(f => f.Status == FieldUnitStatus.Available, cancellationToken);

        var dispatchedFieldUnitsCount = await _dbContext.FieldUnits
            .CountAsync(f => f.Status == FieldUnitStatus.Dispatched, cancellationToken);

        var outOfServiceFieldUnitsCount = await _dbContext.FieldUnits
            .CountAsync(f => f.Status == FieldUnitStatus.OutOfService, cancellationToken);

        var resolvedIncidentTimestamps = await _dbContext.Incidents
            .AsNoTracking()
            .Where(i => i.ResolvedAt != null)
            .Select(i => new { i.ReportedAt, ResolvedAt = i.ResolvedAt!.Value })
            .ToListAsync(cancellationToken);

        double? averageResolutionMinutes = resolvedIncidentTimestamps.Count > 0
            ? Math.Round(
                resolvedIncidentTimestamps.Average(i => (i.ResolvedAt - i.ReportedAt).TotalMinutes),
                1)
            : null;

        var rawIncidentsByType = await _dbContext.Incidents
            .AsNoTracking()
            .GroupBy(i => i.Type)
            .Select(g => new { Type = g.Key, Count = g.Count() })
            .ToListAsync(cancellationToken);

        var incidentsByType = rawIncidentsByType
            .Select(x => new IncidentTypeCountDto(x.Type.ToString(), x.Count))
            .OrderByDescending(x => x.Count)
            .ToList();

        var completedTasksPerUnit = await _dbContext.OperationalTasks
            .AsNoTracking()
            .Where(t => t.Status == OperationalTaskStatus.Completed)
            .GroupBy(t => t.FieldUnitId)
            .Select(g => new { FieldUnitId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.FieldUnitId, x => x.Count, cancellationToken);

        var fieldUnits = await _dbContext.FieldUnits.AsNoTracking().ToListAsync(cancellationToken);

        var fieldUnitWorkload = fieldUnits
            .Select(fu => new FieldUnitWorkloadDto(
                fu.Id,
                fu.UnitCode,
                fu.Type.ToString(),
                completedTasksPerUnit.GetValueOrDefault(fu.Id, 0)))
            .OrderByDescending(w => w.CompletedTaskCount)
            .ThenBy(w => w.UnitCode)
            .ToList();

        return new OperationalStatisticsDto(
            activeIncidentsCount,
            highPriorityActiveIncidentsCount,
            availableFieldUnitsCount,
            dispatchedFieldUnitsCount,
            outOfServiceFieldUnitsCount,
            averageResolutionMinutes,
            incidentsByType,
            fieldUnitWorkload
        );
    }
}
