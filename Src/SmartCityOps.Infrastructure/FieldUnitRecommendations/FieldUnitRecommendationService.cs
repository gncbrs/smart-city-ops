using Microsoft.EntityFrameworkCore;
using SmartCityOps.Application.Common;
using SmartCityOps.Application.Common.Routing;
using SmartCityOps.Application.FieldUnitRecommendations;
using SmartCityOps.Domain.Enums;
using SmartCityOps.Infrastructure.Persistence;

namespace SmartCityOps.Infrastructure.FieldUnitRecommendations;

public class FieldUnitRecommendationService : IFieldUnitRecommendationService
{
    private readonly ApplicationDbContext _dbContext;
    private readonly IEtaEstimator _etaEstimator;
    private readonly IRoutingService _routingService;
    private readonly IEnumerable<IFieldUnitScoringRule> _scoringRules;

    public FieldUnitRecommendationService(
        ApplicationDbContext dbContext,
        IEtaEstimator etaEstimator,
        IRoutingService routingService,
        IEnumerable<IFieldUnitScoringRule> scoringRules)
    {
        _dbContext = dbContext;
        _etaEstimator = etaEstimator;
        _routingService = routingService;
        _scoringRules = scoringRules;
    }

    public async Task<IReadOnlyList<FieldUnitRecommendationDto>> GetRecommendationsAsync(Guid incidentId, CancellationToken cancellationToken)
    {
        var incident = await _dbContext.Incidents
            .AsNoTracking()
            .FirstOrDefaultAsync(i => i.Id == incidentId, cancellationToken)
            ?? throw new KeyNotFoundException("There is no incident.");

        var fieldUnits = await _dbContext.FieldUnits
            .AsNoTracking()
            .ToListAsync(cancellationToken);

        var activeTasks = await _dbContext.OperationalTasks
            .AsNoTracking()
            .Where(t => t.Status == OperationalTaskStatus.Assigned)
            .ToListAsync(cancellationToken);
        var activeTaskByUnitId = activeTasks
            .GroupBy(t => t.FieldUnitId)
            .ToDictionary(g => g.Key, g => g.First());

        var now = DateTimeOffset.UtcNow;
        var effectivePositions = fieldUnits
            .Select(fieldUnit =>
            {
                if (activeTaskByUnitId.TryGetValue(fieldUnit.Id, out var activeTask) &&
                    activeTask.OriginLatitude.HasValue &&
                    activeTask.OriginLongitude.HasValue &&
                    activeTask.EstimatedEtaSeconds.HasValue)
                {
                    return GeoCalculator.GetInFlightPosition(
                        activeTask.OriginLatitude.Value,
                        activeTask.OriginLongitude.Value,
                        fieldUnit.Latitude,
                        fieldUnit.Longitude,
                        activeTask.AssignedAt,
                        activeTask.EstimatedEtaSeconds.Value,
                        now);
                }

                return (fieldUnit.Latitude, fieldUnit.Longitude);
            })
            .ToList();

        var origins = effectivePositions.Select(p => (p.Item1, p.Item2)).ToList();
        var destination = (incident.Latitude, incident.Longitude);
        var matrixResult = origins.Count > 0
            ? await _routingService.GetDrivingTableAsync(origins, destination, cancellationToken)
            : null;

        var totalWeight = _scoringRules.Sum(rule => rule.Weight);

        return fieldUnits
            .Select((fieldUnit, i) =>
            {
                var (effectiveLat, effectiveLng) = effectivePositions[i];

                var durationSec = matrixResult?.DurationsSeconds != null && i < matrixResult.DurationsSeconds.Count
                    ? matrixResult.DurationsSeconds[i]
                    : null;
                var distanceMeters = matrixResult?.DistancesMeters != null && i < matrixResult.DistancesMeters.Count
                    ? matrixResult.DistancesMeters[i]
                    : null;

                double distanceKm;
                TimeSpan eta;
                if (durationSec.HasValue && distanceMeters.HasValue)
                {
                    distanceKm = Math.Round(distanceMeters.Value / 1000.0, 2);
                    eta = TimeSpan.FromSeconds(durationSec.Value);
                }
                else
                {
                    distanceKm = GeoCalculator.CalculateDistanceKm(
                        incident.Latitude, incident.Longitude, effectiveLat, effectiveLng);
                    eta = _etaEstimator.EstimateEta(
                        effectiveLat, effectiveLng, incident.Latitude, incident.Longitude);
                }

                var context = new FieldUnitScoringContext(incident, fieldUnit, eta, distanceKm);
                var ruleResults = _scoringRules
                    .Select(rule => (rule.Weight, Result: rule.Evaluate(context)))
                    .ToList();

                var totalScore = totalWeight > 0
                    ? ruleResults.Sum(r => r.Weight * r.Result.Score) / totalWeight
                    : 0;

                var matchReasons = ruleResults
                    .Select(r => r.Result.Reason)
                    .Where(reason => !string.IsNullOrWhiteSpace(reason))
                    .Select(reason => reason!)
                    .ToList();

                return new FieldUnitRecommendationDto(
                    fieldUnit.Id,
                    fieldUnit.UnitCode,
                    fieldUnit.Type.ToString(),
                    fieldUnit.Status.ToString(),
                    Math.Round(distanceKm, 2),
                    (int)Math.Round(eta.TotalMinutes),
                    Math.Round(totalScore, 1),
                    matchReasons);
            })
            .OrderByDescending(r => r.TotalScore)
            .ToList();
    }
}
