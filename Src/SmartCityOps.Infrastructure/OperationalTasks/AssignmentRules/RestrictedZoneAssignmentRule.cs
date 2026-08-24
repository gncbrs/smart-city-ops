using SmartCityOps.Application.Common;
using SmartCityOps.Application.OperationalTasks.AssignmentRules;
using SmartCityOps.Application.RestrictedZones;
using SmartCityOps.Domain.Enums;

namespace SmartCityOps.Infrastructure.OperationalTasks.AssignmentRules;

public class RestrictedZoneAssignmentRule : ITaskAssignmentRule
{
    private static readonly Dictionary<RestrictedZoneType, FieldUnitType[]> RequiredUnitTypes = new()
    {
        [RestrictedZoneType.Hazard] = [FieldUnitType.Fire, FieldUnitType.Medical],
        [RestrictedZoneType.SecurityLockdown] = [FieldUnitType.Police],
        [RestrictedZoneType.RoadConstruction] = [FieldUnitType.TrafficControl, FieldUnitType.UtilityCrew]
    };

    private readonly IRestrictedZoneService _restrictedZoneService;

    public RestrictedZoneAssignmentRule(IRestrictedZoneService restrictedZoneService)
    {
        _restrictedZoneService = restrictedZoneService;
    }

    public async Task<RuleEvaluationResult> EvaluateAsync(TaskAssignmentContext context, CancellationToken cancellationToken)
    {
        var activeZones = await _restrictedZoneService.GetActiveZonesAsync(cancellationToken);

        var coveringZone = activeZones.FirstOrDefault(zone =>
            GeoCalculator.CalculateDistanceKm(
                zone.Latitude, zone.Longitude, context.Incident.Latitude, context.Incident.Longitude) * 1000
            <= zone.RadiusMeters);

        if (coveringZone is null)
        {
            return RuleEvaluationResult.Success();
        }

        var requiredTypes = RequiredUnitTypes.GetValueOrDefault(coveringZone.ZoneType, []);
        if (requiredTypes.Contains(context.FieldUnit.Type))
        {
            return RuleEvaluationResult.Success();
        }

        return RuleEvaluationResult.Failure(
            $"Bu incident '{coveringZone.Name}' kısıtlı bölgesi ({coveringZone.ZoneType}) içinde; bu bölgeye yalnızca şu unit tipleri atanabilir: {string.Join(", ", requiredTypes)}.");
    }
}
