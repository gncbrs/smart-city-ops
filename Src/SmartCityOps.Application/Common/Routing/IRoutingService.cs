namespace SmartCityOps.Application.Common.Routing;

public interface IRoutingService
{
    Task<RouteGeometryResult> GetDrivingRouteAsync(double originLat, double originLng, double destinationLat, double destinationLng, CancellationToken cancellationToken = default);
}
