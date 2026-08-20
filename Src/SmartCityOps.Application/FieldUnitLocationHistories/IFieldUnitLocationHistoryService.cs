namespace SmartCityOps.Application.FieldUnitLocationHistories;

public interface IFieldUnitLocationHistoryService
{
    Task<IReadOnlyList<FieldUnitLocationHistoryDto>> GetAllAsync(CancellationToken cancellationToken);
}