namespace SmartCityOps.Application.FieldUnitRecommendations;

public interface IFieldUnitScoringRule
{
    double Weight { get; }

    ScoringRuleResult Evaluate(FieldUnitScoringContext context);
}
