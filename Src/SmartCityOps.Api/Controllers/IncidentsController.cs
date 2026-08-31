using Microsoft.AspNetCore.Mvc;
using SmartCityOps.Application.FieldUnitRecommendations;
using SmartCityOps.Application.Incidents;

namespace SmartCityOps.Api.Controllers;

[ApiController]
[Route("api/incidents")]
public class IncidentsController : ControllerBase
{
    private readonly IIncidentService _incidentService;
    private readonly IFieldUnitRecommendationService _fieldUnitRecommendationService;

    public IncidentsController(
        IIncidentService incidentService,
        IFieldUnitRecommendationService fieldUnitRecommendationService)
    {
        _incidentService = incidentService;
        _fieldUnitRecommendationService = fieldUnitRecommendationService;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<IncidentDto>>> GetAll(CancellationToken cancellationToken)
    {
        var incidents = await _incidentService.GetAllAsync(cancellationToken);
        return Ok(incidents);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<IncidentDto>> GetById(Guid id, CancellationToken cancellationToken)
    {
        var incident = await _incidentService.GetByIdAsync(id, cancellationToken);
        return incident is null ? NotFound() : Ok(incident);
    }

    [HttpPost]
    public async Task<ActionResult<IncidentDto>> Create(CreateIncidentDto dto, CancellationToken cancellationToken)
    {
        var created = await _incidentService.CreateAsync(dto, cancellationToken);
        return StatusCode(StatusCodes.Status201Created, created);
    }

    [HttpPost("{id:guid}/resolve")]
    public async Task<ActionResult<IncidentDto>> Resolve(Guid id, CancellationToken cancellationToken)
    {
        var resolved = await _incidentService.ResolveAsync(id, cancellationToken);
        return Ok(resolved);
    }

    [HttpGet("{id:guid}/recommendations")]
    public async Task<ActionResult<IReadOnlyList<FieldUnitRecommendationDto>>> GetRecommendations(Guid id, CancellationToken cancellationToken)
    {
        var recommendations = await _fieldUnitRecommendationService.GetRecommendationsAsync(id, cancellationToken);
        return Ok(recommendations);
    }

    [HttpGet("{id:guid}/timeline")]
    public async Task<ActionResult<IReadOnlyList<IncidentTimelineEventDto>>> GetTimeline(Guid id, CancellationToken cancellationToken)
    {
        var timeline = await _incidentService.GetTimelineAsync(id, cancellationToken);
        return Ok(timeline);
    }
}