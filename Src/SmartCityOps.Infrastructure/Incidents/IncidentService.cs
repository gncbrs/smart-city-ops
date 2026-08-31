using Microsoft.EntityFrameworkCore;
using SmartCityOps.Application.Common.DomainEvents;
using SmartCityOps.Application.Incidents;
using SmartCityOps.Application.Incidents.Events;
using SmartCityOps.Domain.Entities;
using SmartCityOps.Domain.Enums;
using SmartCityOps.Domain.Exceptions;
using SmartCityOps.Infrastructure.Persistence;

namespace SmartCityOps.Infrastructure.Incidents;

public class IncidentService : IIncidentService
{
    private readonly ApplicationDbContext _dbContext;
    private readonly IDomainEventDispatcher _domainEventDispatcher;

    public IncidentService(ApplicationDbContext dbContext, IDomainEventDispatcher domainEventDispatcher)
    {
        _dbContext = dbContext;
        _domainEventDispatcher = domainEventDispatcher;
    }

    public async Task<IReadOnlyList<IncidentDto>> GetAllAsync(CancellationToken cancellationToken)
    {
        var incidents = await _dbContext.Incidents
            .AsNoTracking()
            .ToListAsync(cancellationToken);

        var incidentIdsWithActiveTasks = (await _dbContext.OperationalTasks
            .AsNoTracking()
            .Where(t => t.Status == OperationalTaskStatus.Assigned)
            .Select(t => t.IncidentId)
            .ToListAsync(cancellationToken))
            .ToHashSet();

        var now = DateTimeOffset.UtcNow;

        return incidents
            .Select(i => ToDto(i, now, IsReadyToResolve(i, incidentIdsWithActiveTasks)))
            .OrderBy(dto => dto.Status == IncidentStatus.Resolved.ToString() ? 1 : 0)
            .ThenByDescending(dto => dto.PriorityScore)
            .ThenBy(dto => dto.ReportedAt)
            .ToList();
    }

    public async Task<IncidentDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var incident = await _dbContext.Incidents
            .AsNoTracking()
            .FirstOrDefaultAsync(i => i.Id == id, cancellationToken);

        if (incident is null)
        {
            return null;
        }

        var hasActiveAssignedTasks = await _dbContext.OperationalTasks
            .AsNoTracking()
            .AnyAsync(t => t.IncidentId == id && t.Status == OperationalTaskStatus.Assigned, cancellationToken);

        var isReadyToResolve = incident.Status != IncidentStatus.Resolved && !hasActiveAssignedTasks;

        return ToDto(incident, DateTimeOffset.UtcNow, isReadyToResolve);
    }

    public async Task<IncidentDto> CreateAsync(CreateIncidentDto dto, CancellationToken cancellationToken)
    {
        var incident = new Incident
        {
            Id = Guid.NewGuid(),
            IncidentCode = dto.IncidentCode,
            Type = Enum.Parse<IncidentType>(dto.Type),
            Priority = Enum.Parse<IncidentPriority>(dto.Priority),
            Status = IncidentStatus.Open,
            ReportedAt = dto.ReportedAt,
            Latitude = dto.Latitude,
            Longitude = dto.Longitude,
            Description = dto.Description
        };

        _dbContext.Incidents.Add(incident);
        await _dbContext.SaveChangesAsync(cancellationToken);
        await _domainEventDispatcher.DispatchAsync(new IncidentCreatedEvent(incident.Id), cancellationToken);

        return ToDto(incident, DateTimeOffset.UtcNow, isReadyToResolve: true);
    }

    public async Task<IncidentDto> ResolveAsync(Guid id, CancellationToken cancellationToken)
    {
        var incident = await _dbContext.Incidents
            .FirstOrDefaultAsync(i => i.Id == id, cancellationToken)
            ?? throw new KeyNotFoundException("Incident bulunamadı.");

        if (incident.Status == IncidentStatus.Resolved)
        {
            throw new DomainConflictException("Bu incident zaten resolved.");
        }

        var hasActiveAssignedTasks = await _dbContext.OperationalTasks
            .AnyAsync(t => t.IncidentId == id && t.Status == OperationalTaskStatus.Assigned, cancellationToken);

        if (hasActiveAssignedTasks)
        {
            throw new DomainConflictException(
                "Bu incident'a atanmış aktif görevler bulunmaktadır. Çözülmeden önce görevler tamamlanmalı veya iptal edilmelidir.");
        }

        incident.Status = IncidentStatus.Resolved;
        incident.ResolvedAt = DateTimeOffset.UtcNow;

        await _dbContext.SaveChangesAsync(cancellationToken);
        await _domainEventDispatcher.DispatchAsync(new IncidentResolvedEvent(incident.Id), cancellationToken);

        return ToDto(incident, DateTimeOffset.UtcNow, isReadyToResolve: false);
    }

    public async Task<IReadOnlyList<IncidentTimelineEventDto>> GetTimelineAsync(Guid incidentId, CancellationToken cancellationToken = default)
    {
        var incident = await _dbContext.Incidents
            .AsNoTracking()
            .FirstOrDefaultAsync(i => i.Id == incidentId, cancellationToken)
            ?? throw new KeyNotFoundException("Incident bulunamadı.");

        var tasks = await _dbContext.OperationalTasks
            .AsNoTracking()
            .Where(t => t.IncidentId == incidentId)
            .ToListAsync(cancellationToken);

        var fieldUnitIds = tasks.Select(t => t.FieldUnitId).Distinct().ToList();
        var fieldUnits = await _dbContext.FieldUnits
            .AsNoTracking()
            .Where(f => fieldUnitIds.Contains(f.Id))
            .ToDictionaryAsync(f => f.Id, cancellationToken);

        var events = new List<IncidentTimelineEventDto>
        {
            new($"{incident.Id}-reported", incident.ReportedAt, "Incident reported")
        };

        var now = DateTimeOffset.UtcNow;

        foreach (var task in tasks)
        {
            var unitLabel = fieldUnits.TryGetValue(task.FieldUnitId, out var unit)
                ? $"{unit.Type} ({unit.UnitCode})"
                : "Unknown unit";

            events.Add(new IncidentTimelineEventDto($"{task.Id}-assigned", task.AssignedAt, $"{unitLabel} assigned to incident", task.FieldUnitId.ToString()));

            if (task.EstimatedEtaSeconds.HasValue)
            {
                var calculatedArrival = task.AssignedAt.AddSeconds(task.EstimatedEtaSeconds.Value);

                if (now >= calculatedArrival || task.CompletedAt != null || incident.ResolvedAt != null)
                {
                    var effectiveArrival = task.CompletedAt.HasValue && task.CompletedAt.Value < calculatedArrival
                        ? task.CompletedAt.Value
                        : calculatedArrival;

                    events.Add(new IncidentTimelineEventDto($"{task.Id}-arrived", effectiveArrival, $"{unitLabel} arrived at scene", task.FieldUnitId.ToString()));
                }
            }

            if (task.CompletedAt.HasValue)
            {
                events.Add(new IncidentTimelineEventDto($"{task.Id}-completed", task.CompletedAt.Value, $"{unitLabel} completed task", task.FieldUnitId.ToString()));
            }
        }

        if (incident.ResolvedAt.HasValue)
        {
            events.Add(new IncidentTimelineEventDto($"{incident.Id}-resolved", incident.ResolvedAt.Value, "Incident resolved"));
        }

        return events.OrderBy(e => e.Timestamp).ToList();
    }

    private static bool IsReadyToResolve(Incident incident, HashSet<Guid> incidentIdsWithActiveTasks) =>
        incident.Status != IncidentStatus.Resolved && !incidentIdsWithActiveTasks.Contains(incident.Id);

    private static IncidentDto ToDto(Incident incident, DateTimeOffset now, bool isReadyToResolve) =>
        new(
            incident.Id,
            incident.Type.ToString(),
            incident.Priority.ToString(),
            incident.Status.ToString(),
            incident.ReportedAt,
            incident.Latitude,
            incident.Longitude,
            incident.Description,
            incident.ResolvedAt,
            IncidentPriorityScoreCalculator.Calculate(incident.Priority, incident.ReportedAt, now),
            isReadyToResolve);
}