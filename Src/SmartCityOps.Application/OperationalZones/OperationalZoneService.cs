namespace SmartCityOps.Application.OperationalZones;

public interface IOperationalZoneService
{
    Task<IReadOnlyList<OperationalZoneDto>> GetAllAsync(CancellationToken cancellationToken);
}