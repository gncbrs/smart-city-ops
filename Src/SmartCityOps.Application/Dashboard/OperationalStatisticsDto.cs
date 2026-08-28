namespace SmartCityOps.Application.Dashboard;

public record OperationalStatisticsDto(
    int ActiveIncidentsCount,
    int HighPriorityActiveIncidentsCount,
    int AvailableFieldUnitsCount,
    int DispatchedFieldUnitsCount,
    int OutOfServiceFieldUnitsCount,
    double? AverageResolutionMinutes,
    IReadOnlyList<IncidentTypeCountDto> IncidentsByType,
    IReadOnlyList<FieldUnitWorkloadDto> FieldUnitWorkload
);
