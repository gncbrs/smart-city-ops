using SmartCityOps.Application.FieldUnitRecommendations;

namespace SmartCityOps.Infrastructure.FieldUnitRecommendations.ScoringRules;

public class DistanceScoreRule : IFieldUnitScoringRule
{
    private const double MaxRelevantDistanceKm = 20.0;
    private const double NearbyDistanceKm = 5.0;

    public double Weight => 0.35;

    public ScoringRuleResult Evaluate(FieldUnitScoringContext context)
    {
        var score = Math.Max(0, 100 - context.DistanceKm / MaxRelevantDistanceKm * 100);
        var reason = context.DistanceKm <= NearbyDistanceKm
            ? $"Distance from incident: {context.DistanceKm:F1} km"
            : null;

        return new ScoringRuleResult(score, reason);
    }
}
