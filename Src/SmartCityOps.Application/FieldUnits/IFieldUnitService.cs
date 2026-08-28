namespace SmartCityOps.Application.FieldUnits;

public interface IFieldUnitService
{
    Task<IReadOnlyList<FieldUnitDto>> GetAllAsync(CancellationToken cancellationToken);
    Task<IReadOnlyList<FieldUnitMovementRecordDto>> GetMovementHistoryAsync(Guid fieldUnitId, CancellationToken cancellationToken = default);
    Task<FieldUnitDto> UpdateStatusAsync(Guid id, UpdateFieldUnitStatusDto dto, CancellationToken cancellationToken = default);
}
