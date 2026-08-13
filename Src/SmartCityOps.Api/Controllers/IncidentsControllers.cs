using Microsoft.AspNetCore.Mvc;
using SmartCityOps.Application.Incidents;

namespace SmartCityOps.Api.Controllers;

[ApiController]
[Route("api/incidents")]
public class IncidentsController : ControllerBase
{
    private readonly IIncidentService _incidentService;

    public IncidentsController(IIncidentService incidentService)
    {
        _incidentService = incidentService;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<IncidentDto>>> GetAll(CancellationToken cancellationToken)
    {
        var incidents = await _incidentService.GetAllAsync(cancellationToken);
        return Ok(incidents);
    }

    [HttpPost]
    public async Task<ActionResult<IncidentDto>> Create(CreateIncidentDto dto, CancellationToken cancellationToken)
    {
        try
        {
            var created = await _incidentService.CreateAsync(dto, cancellationToken);
            return StatusCode(StatusCodes.Status201Created, created);
        }
        catch (ArgumentException)
        {
            return BadRequest("Yanlış veye eksik argüman.");
        }
    }
}