using Microsoft.EntityFrameworkCore;
using SmartCityOps.Application.Common.DomainEvents;
using SmartCityOps.Application.FieldUnitRecommendations;
using SmartCityOps.Application.OperationalTasks;
using SmartCityOps.Application.OperationalTasks.AssignmentRules;
using SmartCityOps.Application.OperationalTasks.Events;
using SmartCityOps.Domain.Entities;
using SmartCityOps.Domain.Enums;
using SmartCityOps.Domain.Exceptions;
using SmartCityOps.Infrastructure.Persistence;
using Npgsql;

namespace SmartCityOps.Infrastructure.OperationalTasks;

public class OperationalTaskService : IOperationalTaskService
{
    private readonly ApplicationDbContext _dbContext;
    private readonly IDomainEventDispatcher _domainEventDispatcher;
    private readonly ITaskAssignmentRulePipeline _rulePipeline;
    private readonly IEtaEstimator _etaEstimator;

    public OperationalTaskService(
        ApplicationDbContext dbContext,
        IDomainEventDispatcher domainEventDispatcher,
        ITaskAssignmentRulePipeline rulePipeline,
        IEtaEstimator etaEstimator)
    {
        _dbContext = dbContext;
        _domainEventDispatcher = domainEventDispatcher;
        _rulePipeline = rulePipeline;
        _etaEstimator = etaEstimator;
    }

    public async Task<IReadOnlyList<OperationalTaskDto>> GetAllAsync(CancellationToken cancellationToken)
    {
        return await _dbContext.OperationalTasks
            .AsNoTracking()
            .Select(t => new OperationalTaskDto(
                t.Id,
                t.IncidentId,
                t.FieldUnitId,
                t.Status.ToString(),
                t.AssignedAt,
                t.CompletedAt,
                t.OriginLatitude,
                t.OriginLongitude,
                t.EstimatedEtaSeconds))
            .ToListAsync(cancellationToken);
    }

    public async Task<OperationalTaskDto> CreateAsync(CreateOperationalTaskDto dto, CancellationToken cancellationToken)
    {
        var incident = await _dbContext.Incidents
            .FirstOrDefaultAsync(i => i.Id == dto.IncidentId, cancellationToken)
            ?? throw new KeyNotFoundException("Incident bulunamadı.");

        var fieldUnit = await _dbContext.FieldUnits
            .FirstOrDefaultAsync(f => f.Id == dto.FieldUnitId, cancellationToken)
            ?? throw new KeyNotFoundException("Field unit bulunamadı.");

        var ruleResult = await _rulePipeline.EvaluateAsync(new TaskAssignmentContext(incident, fieldUnit), cancellationToken);
        if (!ruleResult.IsSatisfied)
        {
            throw new ValidationException(ruleResult.FailureReason!);
        }

        var now = DateTimeOffset.UtcNow;
        var originLatitude = fieldUnit.Latitude;
        var originLongitude = fieldUnit.Longitude;
        var estimatedEta = _etaEstimator.EstimateEta(originLatitude, originLongitude, incident.Latitude, incident.Longitude);

        var task = new OperationalTask
        {
            Id = Guid.NewGuid(),
            IncidentId = incident.Id,
            FieldUnitId = fieldUnit.Id,
            Status = OperationalTaskStatus.Assigned,
            AssignedAt = now,
            CompletedAt = null,
            OriginLatitude = originLatitude,
            OriginLongitude = originLongitude,
            EstimatedEtaSeconds = (int)Math.Round(estimatedEta.TotalSeconds)
        };

        fieldUnit.Status = FieldUnitStatus.Dispatched;
        fieldUnit.Latitude = incident.Latitude;
        fieldUnit.Longitude = incident.Longitude;

        var locationHistoryEntry = new FieldUnitLocationHistory
        {
            Id = Guid.NewGuid(),
            FieldUnitId = fieldUnit.Id,
            IncidentId = incident.Id,
            Latitude = incident.Latitude,
            Longitude = incident.Longitude,
            RecordedAt = now
        };

        if (incident.Status == IncidentStatus.Open)
        {
            incident.Status = IncidentStatus.InProgress;
        }

        _dbContext.OperationalTasks.Add(task);
        _dbContext.FieldUnitLocationHistories.Add(locationHistoryEntry);

        try
        {
            await _dbContext.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateException ex) when (ex.InnerException is PostgresException { SqlState: PostgresErrorCodes.UniqueViolation })
        {
            throw new ResourceConflictException("Bu field unit için zaten aktif bir görev atanmış. Başka bir operatör az önce bu unit'i atamış olabilir.");
        }

        await _domainEventDispatcher.DispatchAsync(new TaskAssignedEvent(task.Id, incident.Id, fieldUnit.Id), cancellationToken);

        return ToDto(task);
    }

    public async Task<OperationalTaskDto> CompleteAsync(Guid id, CancellationToken cancellationToken)
    {
        var task = await _dbContext.OperationalTasks
            .FirstOrDefaultAsync(t => t.Id == id, cancellationToken)
            ?? throw new KeyNotFoundException("Task bulunamadı.");

        if (task.Status == OperationalTaskStatus.Completed)
        {
            throw new ValidationException("Bu task zaten tamamlanmış.");
        }

        var fieldUnit = await _dbContext.FieldUnits
            .FirstOrDefaultAsync(f => f.Id == task.FieldUnitId, cancellationToken)
            ?? throw new KeyNotFoundException("Task'a bağlı field unit bulunamadı.");

        task.Status = OperationalTaskStatus.Completed;
        task.CompletedAt = DateTimeOffset.UtcNow;
        fieldUnit.Status = FieldUnitStatus.Available;

        await _dbContext.SaveChangesAsync(cancellationToken);

        await _domainEventDispatcher.DispatchAsync(new TaskCompletedEvent(task.Id, fieldUnit.Id), cancellationToken);

        return ToDto(task);
    }

    public async Task<OperationalTaskDto> ReassignAsync(Guid taskId, ReassignOperationalTaskDto dto, CancellationToken cancellationToken)
    {
        var oldTask = await _dbContext.OperationalTasks
            .FirstOrDefaultAsync(t => t.Id == taskId, cancellationToken)
            ?? throw new KeyNotFoundException("Task bulunamadı.");

        if (oldTask.Status != OperationalTaskStatus.Assigned)
        {
            throw new ValidationException("Sadece Assigned durumundaki bir task yeniden atanabilir.");
        }

        var incident = await _dbContext.Incidents
            .FirstOrDefaultAsync(i => i.Id == oldTask.IncidentId, cancellationToken)
            ?? throw new KeyNotFoundException("Incident bulunamadı.");

        var oldFieldUnit = await _dbContext.FieldUnits
            .FirstOrDefaultAsync(f => f.Id == oldTask.FieldUnitId, cancellationToken)
            ?? throw new KeyNotFoundException("Task'a bağlı field unit bulunamadı.");

        var newFieldUnit = await _dbContext.FieldUnits
            .FirstOrDefaultAsync(f => f.Id == dto.NewFieldUnitId, cancellationToken)
            ?? throw new KeyNotFoundException("Yeni field unit bulunamadı.");

        var ruleResult = await _rulePipeline.EvaluateAsync(new TaskAssignmentContext(incident, newFieldUnit), cancellationToken);
        if (!ruleResult.IsSatisfied)
        {
            throw new ValidationException(ruleResult.FailureReason!);
        }

        var now = DateTimeOffset.UtcNow;
        var originLatitude = newFieldUnit.Latitude;
        var originLongitude = newFieldUnit.Longitude;
        var estimatedEta = _etaEstimator.EstimateEta(originLatitude, originLongitude, incident.Latitude, incident.Longitude);

        oldTask.Status = OperationalTaskStatus.Reassigned;
        oldFieldUnit.Status = FieldUnitStatus.Available;

        var newTask = new OperationalTask
        {
            Id = Guid.NewGuid(),
            IncidentId = incident.Id,
            FieldUnitId = newFieldUnit.Id,
            Status = OperationalTaskStatus.Assigned,
            AssignedAt = now,
            CompletedAt = null,
            OriginLatitude = originLatitude,
            OriginLongitude = originLongitude,
            EstimatedEtaSeconds = (int)Math.Round(estimatedEta.TotalSeconds)
        };

        newFieldUnit.Status = FieldUnitStatus.Dispatched;
        newFieldUnit.Latitude = incident.Latitude;
        newFieldUnit.Longitude = incident.Longitude;

        var locationHistoryEntry = new FieldUnitLocationHistory
        {
            Id = Guid.NewGuid(),
            FieldUnitId = newFieldUnit.Id,
            IncidentId = incident.Id,
            Latitude = incident.Latitude,
            Longitude = incident.Longitude,
            RecordedAt = now
        };

        _dbContext.OperationalTasks.Add(newTask);
        _dbContext.FieldUnitLocationHistories.Add(locationHistoryEntry);

        try
        {
            await _dbContext.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateException ex) when (ex.InnerException is PostgresException { SqlState: PostgresErrorCodes.UniqueViolation })
        {
            throw new ResourceConflictException("Bu field unit için zaten aktif bir görev atanmış. Başka bir operatör az önce bu unit'i atamış olabilir.");
        }

        await _domainEventDispatcher.DispatchAsync(
            new TaskReassignedEvent(oldTask.Id, newTask.Id, incident.Id, oldFieldUnit.Id, newFieldUnit.Id),
            cancellationToken);

        return ToDto(newTask);
    }

    private static OperationalTaskDto ToDto(OperationalTask task) =>
        new(
            task.Id,
            task.IncidentId,
            task.FieldUnitId,
            task.Status.ToString(),
            task.AssignedAt,
            task.CompletedAt,
            task.OriginLatitude,
            task.OriginLongitude,
            task.EstimatedEtaSeconds);
}