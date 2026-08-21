using Microsoft.AspNetCore.Mvc;
using SmartCityOps.Application.OperationalZones;

namespace SmartCityOps.Api.Controllers;

[ApiController]
[Route("api/operational-zones")]
public class OperationalZonesController : ControllerBase
{
    private readonly IOperationalZoneService _operationalZoneService;

    public OperationalZonesController(IOperationalZoneService operationalZoneService)
    {
        _operationalZoneService = operationalZoneService;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<OperationalZoneDto>>> GetAll(CancellationToken cancellationToken)
    {
        var zones = await _operationalZoneService.GetAllAsync(cancellationToken);
        return Ok(zones);
    }
}