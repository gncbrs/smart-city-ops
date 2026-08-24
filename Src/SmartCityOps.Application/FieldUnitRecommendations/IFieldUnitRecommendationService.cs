namespace SmartCityOps.Application.FieldUnitRecommendations;

public interface IFieldUnitRecommendationService
{
    Task<IReadOnlyList<FieldUnitRecommendationDto>> GetRecommendationsAsync(Guid incidentId, CancellationToken cancellationToken);
}
