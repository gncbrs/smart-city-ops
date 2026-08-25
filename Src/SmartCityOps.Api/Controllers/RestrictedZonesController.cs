using Microsoft.AspNetCore.Mvc;
using SmartCityOps.Application.RestrictedZones;

namespace SmartCityOps.Api.Controllers;

[ApiController]
[Route("api/restricted-zones")]
public class RestrictedZonesController : ControllerBase
{
    private readonly IRestrictedZoneService _restrictedZoneService;

    public RestrictedZonesController(IRestrictedZoneService restrictedZoneService)
    {
        _restrictedZoneService = restrictedZoneService;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<RestrictedZoneDto>>> GetAll(CancellationToken cancellationToken)
    {
        var zones = await _restrictedZoneService.GetAllAsync(cancellationToken);
        return Ok(zones);
    }

    [HttpPost]
    public async Task<ActionResult<RestrictedZoneDto>> Create(CreateRestrictedZoneDto dto, CancellationToken cancellationToken)
    {
        try
        {
            var created = await _restrictedZoneService.CreateAsync(dto, cancellationToken);
            return StatusCode(StatusCodes.Status201Created, created);
        }
        catch (ArgumentException)
        {
            return BadRequest("Yanlış veya eksik argüman.");
        }
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<RestrictedZoneDto>> Update(Guid id, UpdateRestrictedZoneDto dto, CancellationToken cancellationToken)
    {
        try
        {
            var updated = await _restrictedZoneService.UpdateAsync(id, dto, cancellationToken);
            return Ok(updated);
        }
        catch (ArgumentException)
        {
            return BadRequest("Yanlış veya eksik argüman.");
        }
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        await _restrictedZoneService.DeleteAsync(id, cancellationToken);
        return NoContent();
    }
}
