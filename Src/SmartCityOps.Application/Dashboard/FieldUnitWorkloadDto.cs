namespace SmartCityOps.Application.Dashboard;

public record FieldUnitWorkloadDto(Guid FieldUnitId, string UnitCode, string UnitType, int CompletedTaskCount);
