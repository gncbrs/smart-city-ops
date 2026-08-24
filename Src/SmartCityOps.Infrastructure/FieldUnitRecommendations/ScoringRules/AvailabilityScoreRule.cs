using SmartCityOps.Application.FieldUnitRecommendations;
using SmartCityOps.Domain.Enums;

namespace SmartCityOps.Infrastructure.FieldUnitRecommendations.ScoringRules;

public class AvailabilityScoreRule : IFieldUnitScoringRule
{
    public double Weight => 0.4;

    public ScoringRuleResult Evaluate(FieldUnitScoringContext context)
    {
        return context.FieldUnit.Status switch
        {
            FieldUnitStatus.Available => new ScoringRuleResult(100, "Unit is available."),
            FieldUnitStatus.Dispatched => new ScoringRuleResult(10, null),
            FieldUnitStatus.OutOfService => new ScoringRuleResult(0, null),
            _ => new ScoringRuleResult(0, null)
        };
    }
}
