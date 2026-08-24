using Microsoft.AspNetCore.Mvc;
using SmartCityOps.Application.OperationsReplay;

namespace SmartCityOps.Api.Controllers;

[ApiController]
[Route("api/operations/replay")]
public class OperationsReplayController : ControllerBase
{
    private readonly IOperationsReplayService _operationsReplayService;

    public OperationsReplayController(IOperationsReplayService operationsReplayService)
    {
        _operationsReplayService = operationsReplayService;
    }

    [HttpGet]
    public async Task<ActionResult<OperationsSnapshotDto>> GetSnapshot(
        [FromQuery] DateTimeOffset timestamp,
        CancellationToken cancellationToken)
    {
        var snapshot = await _operationsReplayService.GetSnapshotAtAsync(timestamp, cancellationToken);
        return Ok(snapshot);
    }

    [HttpGet("range")]
    public async Task<ActionResult<ReplayTimeRangeDto>> GetRange(CancellationToken cancellationToken)
    {
        var range = await _operationsReplayService.GetReplayTimeRangeAsync(cancellationToken);
        return Ok(range);
    }
}
