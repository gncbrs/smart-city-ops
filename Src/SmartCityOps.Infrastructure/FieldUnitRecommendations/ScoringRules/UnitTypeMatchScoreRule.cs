using SmartCityOps.Application.FieldUnitRecommendations;
using SmartCityOps.Domain.Enums;

namespace SmartCityOps.Infrastructure.FieldUnitRecommendations.ScoringRules;

public class UnitTypeMatchScoreRule : IFieldUnitScoringRule
{
    private static readonly Dictionary<IncidentType, FieldUnitType[]> MatchingUnitTypes = new()
    {
        [IncidentType.TrafficAccident] = [FieldUnitType.Medical, FieldUnitType.Police, FieldUnitType.TrafficControl],
        [IncidentType.RoadClosure] = [FieldUnitType.TrafficControl],
        [IncidentType.FireAlert] = [FieldUnitType.Fire],
        [IncidentType.InfrastructureFailure] = [FieldUnitType.UtilityCrew],
        [IncidentType.FloodAlert] = [FieldUnitType.UtilityCrew, FieldUnitType.Fire],
        [IncidentType.PublicSafetyAlert] = [FieldUnitType.Police],
        [IncidentType.UtilityFailure] = [FieldUnitType.UtilityCrew]
    };

    public double Weight => 0.25;

    public ScoringRuleResult Evaluate(FieldUnitScoringContext context)
    {
        var isMatch = MatchingUnitTypes.TryGetValue(context.Incident.Type, out var matchingTypes)
            && matchingTypes.Contains(context.FieldUnit.Type);

        return isMatch
            ? new ScoringRuleResult(100, $"Field unit type is matching with incident: {context.FieldUnit.Type}")
            : new ScoringRuleResult(0, null);
    }
}
