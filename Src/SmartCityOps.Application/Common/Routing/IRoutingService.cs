namespace SmartCityOps.Application.Common.Routing;

public interface IRoutingService
{
    Task<RouteGeometryResult> GetDrivingRouteAsync(double originLat, double originLng, double destinationLat, double destinationLng, CancellationToken cancellationToken = default);

    Task<TravelMatrixResult?> GetDrivingTableAsync(
        IReadOnlyList<(double Latitude, double Longitude)> origins,
        (double Latitude, double Longitude) destination,
        CancellationToken cancellationToken = default);
}
