using SmartCityOps.Application.OperationalTasks.AssignmentRules;

namespace SmartCityOps.Infrastructure.OperationalTasks.AssignmentRules;

public class TaskAssignmentRulePipeline : ITaskAssignmentRulePipeline
{
    private readonly IEnumerable<ITaskAssignmentRule> _rules;

    public TaskAssignmentRulePipeline(IEnumerable<ITaskAssignmentRule> rules)
    {
        _rules = rules;
    }

    public async Task<RuleEvaluationResult> EvaluateAsync(TaskAssignmentContext context, CancellationToken cancellationToken)
    {
        foreach (var rule in _rules)
        {
            var result = await rule.EvaluateAsync(context, cancellationToken);
            if (!result.IsSatisfied)
            {
                return result;
            }
        }

        return RuleEvaluationResult.Success();
    }
}
