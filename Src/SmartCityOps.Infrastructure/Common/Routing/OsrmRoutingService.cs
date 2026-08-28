using System.Globalization;
using System.Text.Json;
using Microsoft.Extensions.Logging;
using SmartCityOps.Application.Common;
using SmartCityOps.Application.Common.Routing;

namespace SmartCityOps.Infrastructure.Common.Routing;

public class OsrmRoutingService : IRoutingService
{
    private const double FallbackAverageSpeedKmh = 40.0;

    private readonly HttpClient _httpClient;
    private readonly ILogger<OsrmRoutingService> _logger;

    public OsrmRoutingService(HttpClient httpClient, ILogger<OsrmRoutingService> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
    }

    public async Task<RouteGeometryResult> GetDrivingRouteAsync(
        double originLat,
        double originLng,
        double destinationLat,
        double destinationLng,
        CancellationToken cancellationToken = default)
    {
        var requestUrl = FormattableString.Invariant(
            $"https://router.project-osrm.org/route/v1/driving/{originLng},{originLat};{destinationLng},{destinationLat}?overview=full&geometries=geojson");

        try
        {
            using var response = await _httpClient.GetAsync(requestUrl, cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                var body = await response.Content.ReadAsStringAsync(cancellationToken);
                _logger.LogWarning(
                    "OSRM routing request to {RequestUrl} failed with status {StatusCode}. Response body: {ResponseBody}. Falling back to straight-line route.",
                    requestUrl,
                    (int)response.StatusCode,
                    body);

                return BuildFallbackResult(originLat, originLng, destinationLat, destinationLng);
            }

            using var stream = await response.Content.ReadAsStreamAsync(cancellationToken);
            using var document = await JsonDocument.ParseAsync(stream, cancellationToken: cancellationToken);

            var route = document.RootElement.GetProperty("routes")[0];
            var coordinates = JsonSerializer.Serialize(route.GetProperty("geometry").GetProperty("coordinates"));
            var durationSeconds = (int)route.GetProperty("duration").GetDouble();
            var distanceMeters = route.GetProperty("distance").GetDouble();

            return new RouteGeometryResult(coordinates, durationSeconds, distanceMeters);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(
                ex,
                "OSRM routing request to {RequestUrl} threw an exception. Falling back to straight-line route.",
                requestUrl);

            return BuildFallbackResult(originLat, originLng, destinationLat, destinationLng);
        }
    }

    private static RouteGeometryResult BuildFallbackResult(
        double originLat,
        double originLng,
        double destinationLat,
        double destinationLng)
    {
        var geoJsonCoordinates = FormattableString.Invariant(
            $"[[{originLng.ToString(CultureInfo.InvariantCulture)}, {originLat.ToString(CultureInfo.InvariantCulture)}], [{destinationLng.ToString(CultureInfo.InvariantCulture)}, {destinationLat.ToString(CultureInfo.InvariantCulture)}]]");

        var distanceKm = GeoCalculator.CalculateDistanceKm(originLat, originLng, destinationLat, destinationLng);
        var durationSeconds = (int)(distanceKm / FallbackAverageSpeedKmh * 3600);

        return new RouteGeometryResult(geoJsonCoordinates, durationSeconds, distanceKm * 1000);
    }
}
