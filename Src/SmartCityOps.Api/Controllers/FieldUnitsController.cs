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
}