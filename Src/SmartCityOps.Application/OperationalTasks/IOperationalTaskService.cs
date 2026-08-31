namespace SmartCityOps.Application.OperationalTasks;

public interface IOperationalTaskService
{
    Task<IReadOnlyList<OperationalTaskDto>> GetAllAsync(CancellationToken cancellationToken);
    Task<OperationalTaskDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<OperationalTaskDto> CreateAsync(CreateOperationalTaskDto dto, CancellationToken cancellationToken);
    Task<OperationalTaskDto> CompleteAsync(Guid id, CancellationToken cancellationToken);
    Task<OperationalTaskDto> ReassignAsync(Guid taskId, ReassignOperationalTaskDto dto, CancellationToken cancellationToken);
    Task<OperationalTaskDto> CancelAsync(Guid id, CancellationToken cancellationToken = default);
}