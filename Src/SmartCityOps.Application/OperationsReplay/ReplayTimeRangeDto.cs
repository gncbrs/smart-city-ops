namespace SmartCityOps.Application.OperationsReplay;

public record ReplayTimeRangeDto(
    DateTimeOffset? MinTimestamp,
    DateTimeOffset? MaxTimestamp
);
