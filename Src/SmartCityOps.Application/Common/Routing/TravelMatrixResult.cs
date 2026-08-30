namespace SmartCityOps.Application.Common.Routing;

public record TravelMatrixResult(
    IReadOnlyList<double?> DurationsSeconds,
    IReadOnlyList<double?> DistancesMeters
);
