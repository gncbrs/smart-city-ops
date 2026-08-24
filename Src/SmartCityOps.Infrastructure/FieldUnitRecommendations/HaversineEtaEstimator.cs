using SmartCityOps.Application.Common;
using SmartCityOps.Application.FieldUnitRecommendations;

namespace SmartCityOps.Infrastructure.FieldUnitRecommendations;

public class HaversineEtaEstimator : IEtaEstimator
{
    private const double AverageCitySpeedKmh = 40.0;

    public TimeSpan EstimateEta(double fromLat, double fromLng, double toLat, double toLng)
    {
        var distanceKm = GeoCalculator.CalculateDistanceKm(fromLat, fromLng, toLat, toLng);
        var hours = distanceKm / AverageCitySpeedKmh;

        return TimeSpan.FromHours(hours);
    }
}
