using Microsoft.EntityFrameworkCore;
using SmartCityOps.Application.Incidents;
using SmartCityOps.Domain.Entities;
using SmartCityOps.Domain.Enums;
using SmartCityOps.Infrastructure.Persistence;

namespace SmartCityOps.Infrastructure.Incidents;

public class IncidentService : IIncidentService
{
    private readonly ApplicationDbContext _dbContext;

    public IncidentService(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<IReadOnlyList<IncidentDto>> GetAllAsync(CancellationToken cancellationToken)
    {
        return await _dbContext.Incidents
            .AsNoTracking()
            .Select(i => new IncidentDto(
                i.Id,
                i.Type.ToString(),
                i.Priority.ToString(),
                i.Status.ToString(),
                i.ReportedAt,
                i.Latitude,
                i.Longitude,
                i.Description))
            .ToListAsync(cancellationToken);
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

        return new IncidentDto(
            incident.Id,
            incident.Type.ToString(),
            incident.Priority.ToString(),
            incident.Status.ToString(),
            incident.ReportedAt,
            incident.Latitude,
            incident.Longitude,
            incident.Description);
    }

    public async Task<IncidentDto> ResolveAsync(Guid id, CancellationToken cancellationToken)
    {
        var incident = await _dbContext.Incidents
            .FirstOrDefaultAsync(i => i.Id == id, cancellationToken)
            ?? throw new KeyNotFoundException("Incident bulunamadı.");

        if (incident.Status == IncidentStatus.Resolved)
        {
            throw new InvalidOperationException("Bu incident zaten resolved.");
        }

        var openTasks = await _dbContext.OperationalTasks
            .Where(t => t.IncidentId == id && t.Status == OperationalTaskStatus.Assigned)
            .ToListAsync(cancellationToken);

        foreach (var task in openTasks)
        {
            task.Status = OperationalTaskStatus.Completed;
            task.CompletedAt = DateTimeOffset.UtcNow;

            var fieldUnit = await _dbContext.FieldUnits
                .FirstOrDefaultAsync(f => f.Id == task.FieldUnitId, cancellationToken);

            if (fieldUnit is not null)
            {
                fieldUnit.Status = FieldUnitStatus.Available;
            }
        }

        incident.Status = IncidentStatus.Resolved;

        await _dbContext.SaveChangesAsync(cancellationToken);

        return new IncidentDto(
            incident.Id,
            incident.Type.ToString(),
            incident.Priority.ToString(),
            incident.Status.ToString(),
            incident.ReportedAt,
            incident.Latitude,
            incident.Longitude,
            incident.Description);
    }
}