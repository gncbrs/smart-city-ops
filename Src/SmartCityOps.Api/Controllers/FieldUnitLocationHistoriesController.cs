using Microsoft.AspNetCore.Mvc;
using SmartCityOps.Application.FieldUnitLocationHistories;

namespace SmartCityOps.Api.Controllers;

[ApiController]
[Route("api/field-unit-location-histories")]
public class FieldUnitLocationHistoriesController : ControllerBase
{
    private readonly IFieldUnitLocationHistoryService fieldUnitLocationHistoryService;

    public FieldUnitLocationHistoriesController(IFieldUnitLocationHistoryService fieldUnitLocationHistoryService)
    {
        this.fieldUnitLocationHistoryService = fieldUnitLocationHistoryService;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<FieldUnitLocationHistoryDto>>> GetAll(CancellationToken cancellationToken)
    {
        var fieldUnitLocationHistories = await fieldUnitLocationHistoryService.GetAllAsync(cancellationToken);
        return Ok(fieldUnitLocationHistories);
    }
}