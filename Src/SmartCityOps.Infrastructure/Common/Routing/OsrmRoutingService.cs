using System.Diagnostics;
using System.Globalization;
using System.Text.Json;
using Microsoft.Extensions.Logging;
using SmartCityOps.Application.Common;
using SmartCityOps.Application.Common.Routing;

namespace SmartCityOps.Infrastructure.Common.Routing;

// Routes through the system `curl` binary rather than HttpClient: .NET's native TLS stack on
// macOS (AppleCrypto/Security.framework) fails the TLS handshake against this host's
// ECDSA-with-SHA384-signed certificate ("handshake failure", no client-side SslClientAuthenticationOptions
// works around it), while curl (LibreSSL) negotiates it fine. See DEVELOPMENT_LOG.md for the
// diagnosis that ruled out TLS-version pinning, revocation-check disabling, and HTTP/1.1 forcing.
public class OsrmRoutingService : IRoutingService
{
    private const double FallbackAverageSpeedKmh = 40.0;
    private const int TimeoutSeconds = 3;

    private readonly ILogger<OsrmRoutingService> _logger;

    public OsrmRoutingService(ILogger<OsrmRoutingService> logger)
    {
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
            var responseBody = await RunCurlAsync(requestUrl, cancellationToken);

            using var document = JsonDocument.Parse(responseBody);
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
                "OSRM routing request to {RequestUrl} failed. Falling back to straight-line route.",
                requestUrl);

            return BuildFallbackResult(originLat, originLng, destinationLat, destinationLng);
        }
    }

    public async Task<TravelMatrixResult?> GetDrivingTableAsync(
        IReadOnlyList<(double Latitude, double Longitude)> origins,
        (double Latitude, double Longitude) destination,
        CancellationToken cancellationToken = default)
    {
        var coordinates = string.Join(';', origins
            .Select(origin => FormattableString.Invariant($"{origin.Longitude},{origin.Latitude}"))
            .Append(FormattableString.Invariant($"{destination.Longitude},{destination.Latitude}")));

        var sources = string.Join(';', Enumerable.Range(0, origins.Count));
        var destinationIndex = origins.Count;

        var requestUrl = FormattableString.Invariant(
            $"https://router.project-osrm.org/table/v1/driving/{coordinates}?sources={sources}&destinations={destinationIndex}&annotations=duration,distance");

        try
        {
            var responseBody = await RunCurlAsync(requestUrl, cancellationToken);

            using var document = JsonDocument.Parse(responseBody);
            var root = document.RootElement;

            if (root.GetProperty("code").GetString() != "Ok")
            {
                throw new InvalidOperationException($"OSRM table request returned non-Ok code: {root.GetProperty("code").GetString()}");
            }

            var durations = root.GetProperty("durations")
                .EnumerateArray()
                .Select(row => row[0].ValueKind == JsonValueKind.Null ? (double?)null : row[0].GetDouble())
                .ToList();

            var distances = root.GetProperty("distances")
                .EnumerateArray()
                .Select(row => row[0].ValueKind == JsonValueKind.Null ? (double?)null : row[0].GetDouble())
                .ToList();

            return new TravelMatrixResult(durations, distances);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(
                ex,
                "OSRM table request to {RequestUrl} failed. Falling back to Haversine calculations.",
                requestUrl);

            return null;
        }
    }

    private static async Task<string> RunCurlAsync(string requestUrl, CancellationToken cancellationToken)
    {
        var startInfo = new ProcessStartInfo
        {
            FileName = "curl",
            RedirectStandardOutput = true,
            RedirectStandardError = true,
            UseShellExecute = false,
            CreateNoWindow = true
        };
        startInfo.ArgumentList.Add("-s");
        startInfo.ArgumentList.Add("--fail");
        startInfo.ArgumentList.Add("-m");
        startInfo.ArgumentList.Add(TimeoutSeconds.ToString(CultureInfo.InvariantCulture));
        startInfo.ArgumentList.Add(requestUrl);

        using var process = new Process { StartInfo = startInfo };
        process.Start();

        using var timeoutCts = new CancellationTokenSource(TimeSpan.FromSeconds(TimeoutSeconds + 1));
        using var linkedCts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken, timeoutCts.Token);

        var stdoutTask = process.StandardOutput.ReadToEndAsync(linkedCts.Token);
        var stderrTask = process.StandardError.ReadToEndAsync(linkedCts.Token);

        try
        {
            await process.WaitForExitAsync(linkedCts.Token);
        }
        catch (OperationCanceledException)
        {
            if (!process.HasExited)
            {
                process.Kill(entireProcessTree: true);
            }

            throw;
        }

        var stdout = await stdoutTask;
        var stderr = await stderrTask;

        if (process.ExitCode != 0)
        {
            throw new InvalidOperationException($"curl exited with code {process.ExitCode}: {stderr}");
        }

        return stdout;
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
