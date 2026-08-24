using SmartCityOps.Application.Incidents;
using SmartCityOps.Application.OperationalTasks;

namespace SmartCityOps.Application.OperationsReplay;

public record OperationsSnapshotDto(
    DateTimeOffset Timestamp,
    IReadOnlyList<IncidentDto> Incidents,
    IReadOnlyList<FieldUnitReplayDto> FieldUnits,
    IReadOnlyList<OperationalTaskDto> ActiveTasks
);
