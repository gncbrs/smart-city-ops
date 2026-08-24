namespace SmartCityOps.Application.OperationsReplay;

public interface IOperationsReplayService
{
    Task<OperationsSnapshotDto> GetSnapshotAtAsync(DateTimeOffset timestamp, CancellationToken cancellationToken);

    Task<ReplayTimeRangeDto> GetReplayTimeRangeAsync(CancellationToken cancellationToken);
}
