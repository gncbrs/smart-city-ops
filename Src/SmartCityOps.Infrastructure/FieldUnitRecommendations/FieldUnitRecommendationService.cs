using Microsoft.EntityFrameworkCore;
using SmartCityOps.Application.Common;
using SmartCityOps.Application.FieldUnitRecommendations;
using SmartCityOps.Infrastructure.Persistence;

namespace SmartCityOps.Infrastructure.FieldUnitRecommendations;

public class FieldUnitRecommendationService : IFieldUnitRecommendationService
{
    private readonly ApplicationDbContext _dbContext;
    private readonly IEtaEstimator _etaEstimator;
    private readonly IEnumerable<IFieldUnitScoringRule> _scoringRules;

    public FieldUnitRecommendationService(
        ApplicationDbContext dbContext,
        IEtaEstimator etaEstimator,
        IEnumerable<IFieldUnitScoringRule> scoringRules)
    {
        _dbContext = dbContext;
        _etaEstimator = etaEstimator;
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

        var totalWeight = _scoringRules.Sum(rule => rule.Weight);

        return fieldUnits
            .Select(fieldUnit =>
            {
                var distanceKm = GeoCalculator.CalculateDistanceKm(
                    incident.Latitude, incident.Longitude, fieldUnit.Latitude, fieldUnit.Longitude);
                var eta = _etaEstimator.EstimateEta(
                    fieldUnit.Latitude, fieldUnit.Longitude, incident.Latitude, incident.Longitude);

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
