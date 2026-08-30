using Microsoft.AspNetCore.Mvc;
using SmartCityOps.Application.OperationalTasks;

namespace SmartCityOps.Api.Controllers;

[ApiController]
[Route("api/operational-tasks")]
public class OperationalTasksController : ControllerBase
{
    private readonly IOperationalTaskService _operationalTaskService;

    public OperationalTasksController(IOperationalTaskService operationalTaskService)
    {
        _operationalTaskService = operationalTaskService;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<OperationalTaskDto>>> GetAll(CancellationToken cancellationToken)
    {
        var tasks = await _operationalTaskService.GetAllAsync(cancellationToken);
        return Ok(tasks);
    }

    [HttpPost]
    public async Task<ActionResult<OperationalTaskDto>> Create(CreateOperationalTaskDto dto, CancellationToken cancellationToken)
    {
        var created = await _operationalTaskService.CreateAsync(dto, cancellationToken);
        return StatusCode(StatusCodes.Status201Created, created);
    }

    [HttpPost("{id:guid}/complete")]
    public async Task<ActionResult<OperationalTaskDto>> Complete(Guid id, CancellationToken cancellationToken)
    {
        var completed = await _operationalTaskService.CompleteAsync(id, cancellationToken);
        return Ok(completed);
    }

    [HttpPost("{id:guid}/reassign")]
    public async Task<ActionResult<OperationalTaskDto>> Reassign(Guid id, ReassignOperationalTaskDto dto, CancellationToken cancellationToken)
    {
        var reassigned = await _operationalTaskService.ReassignAsync(id, dto, cancellationToken);
        return Ok(reassigned);
    }

    [HttpPost("{id:guid}/cancel")]
    public async Task<ActionResult<OperationalTaskDto>> Cancel(Guid id, CancellationToken cancellationToken)
    {
        var cancelled = await _operationalTaskService.CancelAsync(id, cancellationToken);
        return Ok(cancelled);
    }
}
