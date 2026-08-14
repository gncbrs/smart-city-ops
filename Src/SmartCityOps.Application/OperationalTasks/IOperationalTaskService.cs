namespace SmartCityOps.Application.OperationalTasks;

public interface IOperationalTaskService
{
    Task<IReadOnlyList<OperationalTaskDto>> GetAllAsync(CancellationToken cancellationToken);
    Task<OperationalTaskDto> CreateAsync(CreateOperationalTaskDto dto, CancellationToken cancellationToken);
    Task<OperationalTaskDto> CompleteAsync(Guid id, CancellationToken cancellationToken);
}