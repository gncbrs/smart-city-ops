namespace SmartCityOps.Application.FieldUnits;

public interface IFieldUnitService
{
    Task<IReadOnlyList<FieldUnitDto>> GetAllAsync(CancellationToken cancellationToken);
}
