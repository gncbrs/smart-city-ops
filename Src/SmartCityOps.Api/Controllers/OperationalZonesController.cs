using Microsoft.AspNetCore.Mvc;
using SmartCityOps.Application.OperationalZones;

namespace SmartCityOps.Api.Controllers;

[ApiController]
[Route("api/operational-zones")]
public class OperationalZonesController : ControllerBase
{
    private readonly IOperationalZoneService operationalZoneService;

    public OperationalZonesController(IOperationalZoneService operationalZoneService)
    {
        this.operationalZoneService = operationalZoneService;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<OperationalZoneDto>>> GetAll(CancellationToken cancellationToken)
    {
        var zones = await operationalZoneService.GetAllAsync(cancellationToken);
        return Ok(zones);
    }
}