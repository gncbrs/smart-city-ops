namespace SmartCityOps.Application.FieldUnitRecommendations;

public record FieldUnitRecommendationDto(
    Guid FieldUnitId,
    string UnitCode,
    string UnitType,
    string Status,
    double DistanceKm,
    int EstimatedEtaMinutes,
    double TotalScore,
    IReadOnlyList<string> MatchReasons
);
