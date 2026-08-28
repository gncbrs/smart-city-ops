using Microsoft.AspNetCore.Mvc;
using SmartCityOps.Application.Dashboard;

namespace SmartCityOps.Api.Controllers;

[ApiController]
[Route("api/operations/statistics")]
public class OperationalStatisticsController : ControllerBase
{
    private readonly IOperationalStatisticsService _statisticsService;

    public OperationalStatisticsController(IOperationalStatisticsService statisticsService)
    {
        _statisticsService = statisticsService;
    }

    [HttpGet]
    public async Task<ActionResult<OperationalStatisticsDto>> GetStatistics(CancellationToken cancellationToken)
    {
        var statistics = await _statisticsService.GetStatisticsAsync(cancellationToken);
        return Ok(statistics);
    }
}
