namespace SmartCityOps.Application.Common;

public static class GeoCalculator
{
    private const double EarthRadiusKm = 6371.0;

    public static double CalculateDistanceKm(double fromLat, double fromLng, double toLat, double toLng)
    {
        var dLat = DegreesToRadians(toLat - fromLat);
        var dLng = DegreesToRadians(toLng - fromLng);

        var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                Math.Cos(DegreesToRadians(fromLat)) * Math.Cos(DegreesToRadians(toLat)) *
                Math.Sin(dLng / 2) * Math.Sin(dLng / 2);

        var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));

        return EarthRadiusKm * c;
    }

    public static (double Latitude, double Longitude) GetInFlightPosition(
        double originLat,
        double originLng,
        double destLat,
        double destLng,
        DateTimeOffset assignedAt,
        int estimatedEtaSeconds,
        DateTimeOffset now)
    {
        if (estimatedEtaSeconds <= 0)
        {
            return (destLat, destLng);
        }

        var elapsedSeconds = (now - assignedAt).TotalSeconds;
        var progress = Math.Clamp(elapsedSeconds / estimatedEtaSeconds, 0.0, 1.0);

        if (progress >= 1.0)
        {
            return (destLat, destLng);
        }

        var lat = originLat + progress * (destLat - originLat);
        var lng = originLng + progress * (destLng - originLng);
        return (lat, lng);
    }

    private static double DegreesToRadians(double degrees) => degrees * Math.PI / 180.0;
}
