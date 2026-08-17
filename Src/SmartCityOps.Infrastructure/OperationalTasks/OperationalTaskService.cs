using Microsoft.EntityFrameworkCore;
using SmartCityOps.Application.OperationalTasks;
using SmartCityOps.Domain.Entities;
using SmartCityOps.Domain.Enums;
using SmartCityOps.Infrastructure.Persistence;

namespace SmartCityOps.Infrastructure.OperationalTasks;

public class OperationalTaskService : IOperationalTaskService
{
    private readonly ApplicationDbContext _dbContext;

    public OperationalTaskService(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
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
                t.CompletedAt))
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

        if (fieldUnit.Status != FieldUnitStatus.Available)
        {
            throw new InvalidOperationException("Sadece Available durumundaki field unit'ler atanabilir.");
        }

        //Incident resolved kontrolü
        if (incident.Status == IncidentStatus.Resolved)
        {
            throw new InvalidOperationException("Resolved durumda ki bir incident'a task atanamaz.");
        }

        var task = new OperationalTask
        {
            Id = Guid.NewGuid(),
            IncidentId = incident.Id,
            FieldUnitId = fieldUnit.Id,
            Status = OperationalTaskStatus.Assigned,
            AssignedAt = DateTimeOffset.UtcNow,
            CompletedAt = null
        };

        fieldUnit.Status = FieldUnitStatus.Dispatched;

        if (incident.Status == IncidentStatus.Open)
        {
            incident.Status = IncidentStatus.InProgress;
        }

        _dbContext.OperationalTasks.Add(task);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return new OperationalTaskDto(task.Id, task.IncidentId, task.FieldUnitId, task.Status.ToString(), task.AssignedAt, task.CompletedAt);
    }

    public async Task<OperationalTaskDto> CompleteAsync(Guid id, CancellationToken cancellationToken)
    {
        var task = await _dbContext.OperationalTasks
            .FirstOrDefaultAsync(t => t.Id == id, cancellationToken)
            ?? throw new KeyNotFoundException("Task bulunamadı.");

        if (task.Status == OperationalTaskStatus.Completed)
        {
            throw new InvalidOperationException("Bu task zaten tamamlanmış.");
        }

        var fieldUnit = await _dbContext.FieldUnits
            .FirstOrDefaultAsync(f => f.Id == task.FieldUnitId, cancellationToken)
            ?? throw new KeyNotFoundException("Task'a bağlı field unit bulunamadı.");

        task.Status = OperationalTaskStatus.Completed;
        task.CompletedAt = DateTimeOffset.UtcNow;
        fieldUnit.Status = FieldUnitStatus.Available;

        await _dbContext.SaveChangesAsync(cancellationToken);

        return new OperationalTaskDto(task.Id, task.IncidentId, task.FieldUnitId, task.Status.ToString(), task.AssignedAt, task.CompletedAt);
    }
}