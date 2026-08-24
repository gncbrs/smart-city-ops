namespace SmartCityOps.Application.FieldUnitRecommendations;

public interface IEtaEstimator
{
    TimeSpan EstimateEta(double fromLat, double fromLng, double toLat, double toLng);
}
