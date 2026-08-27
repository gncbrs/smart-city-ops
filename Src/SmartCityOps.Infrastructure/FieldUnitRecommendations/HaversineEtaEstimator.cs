using SmartCityOps.Application.Common;
using SmartCityOps.Application.FieldUnitRecommendations;

namespace SmartCityOps.Infrastructure.FieldUnitRecommendations;

public class HaversineEtaEstimator : IEtaEstimator
{
    //It is normally 40.0 but it is too slow for demo so i changed the value to 82 :)
    private const double AverageCitySpeedKmh = 82.0;

    public TimeSpan EstimateEta(double fromLat, double fromLng, double toLat, double toLng)
    {
        var distanceKm = GeoCalculator.CalculateDistanceKm(fromLat, fromLng, toLat, toLng);
        var hours = distanceKm / AverageCitySpeedKmh;

        return TimeSpan.FromHours(hours);
    }
}
