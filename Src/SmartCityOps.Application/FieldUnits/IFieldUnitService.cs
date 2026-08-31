namespace SmartCityOps.Application.FieldUnits;

public interface IFieldUnitService
{
    Task<IReadOnlyList<FieldUnitDto>> GetAllAsync(CancellationToken cancellationToken);
    Task<FieldUnitDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<FieldUnitMovementRecordDto>> GetMovementHistoryAsync(Guid fieldUnitId, CancellationToken cancellationToken = default);
    Task<FieldUnitDto> UpdateStatusAsync(Guid id, UpdateFieldUnitStatusDto dto, CancellationToken cancellationToken = default);
}
