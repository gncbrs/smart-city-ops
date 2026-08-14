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
        try
        {
            var created = await _operationalTaskService.CreateAsync(dto, cancellationToken);
            return StatusCode(StatusCodes.Status201Created, created);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(ex.Message);
        }
    }

    [HttpPost("{id:guid}/complete")]
    public async Task<ActionResult<OperationalTaskDto>> Complete(Guid id, CancellationToken cancellationToken)
    {
        try
        {
            var completed = await _operationalTaskService.CompleteAsync(id, cancellationToken);
            return Ok(completed);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(ex.Message);
        }
    }
}
