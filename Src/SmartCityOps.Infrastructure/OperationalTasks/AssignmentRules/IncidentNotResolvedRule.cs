using SmartCityOps.Application.OperationalTasks.AssignmentRules;
using SmartCityOps.Domain.Enums;

namespace SmartCityOps.Infrastructure.OperationalTasks.AssignmentRules;

public class IncidentNotResolvedRule : ITaskAssignmentRule
{
    public Task<RuleEvaluationResult> EvaluateAsync(TaskAssignmentContext context, CancellationToken cancellationToken)
    {
        var result = context.Incident.Status != IncidentStatus.Resolved
            ? RuleEvaluationResult.Success()
            : RuleEvaluationResult.Failure("Resolved durumda ki bir incident'a task atanamaz.");

        return Task.FromResult(result);
    }
}
