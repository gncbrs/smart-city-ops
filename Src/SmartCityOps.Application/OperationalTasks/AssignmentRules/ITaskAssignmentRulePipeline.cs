namespace SmartCityOps.Application.OperationalTasks.AssignmentRules;

public interface ITaskAssignmentRulePipeline
{
    Task<RuleEvaluationResult> EvaluateAsync(TaskAssignmentContext context, CancellationToken cancellationToken);
}
