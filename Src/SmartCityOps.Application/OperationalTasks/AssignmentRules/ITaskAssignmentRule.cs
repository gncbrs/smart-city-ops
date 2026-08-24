namespace SmartCityOps.Application.OperationalTasks.AssignmentRules;

public interface ITaskAssignmentRule
{
    Task<RuleEvaluationResult> EvaluateAsync(TaskAssignmentContext context, CancellationToken cancellationToken);
}
