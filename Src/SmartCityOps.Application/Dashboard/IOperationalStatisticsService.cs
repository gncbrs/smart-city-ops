namespace SmartCityOps.Application.Dashboard;

public interface IOperationalStatisticsService
{
    Task<OperationalStatisticsDto> GetStatisticsAsync(CancellationToken cancellationToken = default);
}
