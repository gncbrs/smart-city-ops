namespace SmartCityOps.Application.OperationalTasks;

public record CreateOperationalTaskDto(
    Guid IncidentId,
    Guid FieldUnitId
);