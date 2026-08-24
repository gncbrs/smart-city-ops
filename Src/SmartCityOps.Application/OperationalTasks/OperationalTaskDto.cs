namespace SmartCityOps.Application.OperationalTasks;

public record OperationalTaskDto(
    Guid Id,
    Guid IncidentId,
    Guid FieldUnitId,
    string Status,
    DateTimeOffset AssignedAt,
    DateTimeOffset? CompletedAt,
    double? OriginLatitude,
    double? OriginLongitude,
    int? EstimatedEtaSeconds
);