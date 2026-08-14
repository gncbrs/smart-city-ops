namespace SmartCityOps.Application.Incidents;

public interface IIncidentService
{
    Task<IReadOnlyList<IncidentDto>> GetAllAsync(CancellationToken cancellationToken);
    Task<IncidentDto> CreateAsync(CreateIncidentDto dto, CancellationToken cancellationToken);
    Task<IncidentDto> ResolveAsync(Guid id, CancellationToken cancellationToken);
}