using Microsoft.AspNetCore.Mvc;
using SmartCityOps.Application.FieldUnits;

namespace SmartCityOps.Api.Controllers;

[ApiController]
[Route("api/field-units")]
public class FieldUnitsController : ControllerBase
{
    private readonly IFieldUnitService fieldUnitService;

    public FieldUnitsController(IFieldUnitService fieldUnitService)
    {
        this.fieldUnitService = fieldUnitService;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<FieldUnitDto>>> GetAll(CancellationToken cancellationToken)
    {
        var fieldUnits = await fieldUnitService.GetAllAsync(cancellationToken);
        return Ok(fieldUnits);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<FieldUnitDto>> GetById(Guid id, CancellationToken cancellationToken)
    {
        var fieldUnit = await fieldUnitService.GetByIdAsync(id, cancellationToken);
        return fieldUnit is null ? NotFound() : Ok(fieldUnit);
    }

    [HttpGet("{id:guid}/movement-history")]
    public async Task<ActionResult<IReadOnlyList<FieldUnitMovementRecordDto>>> GetMovementHistory(Guid id, CancellationToken cancellationToken)
    {
        var history = await fieldUnitService.GetMovementHistoryAsync(id, cancellationToken);
        return Ok(history);
    }

    [HttpPatch("{id:guid}/status")]
    public async Task<ActionResult<FieldUnitDto>> UpdateStatus(
        Guid id,
        [FromBody] UpdateFieldUnitStatusDto dto,
        CancellationToken cancellationToken)
    {
        var result = await fieldUnitService.UpdateStatusAsync(id, dto, cancellationToken);
        return Ok(result);
    }
}