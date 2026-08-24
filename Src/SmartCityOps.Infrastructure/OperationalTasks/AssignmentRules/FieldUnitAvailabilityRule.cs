using SmartCityOps.Application.OperationalTasks.AssignmentRules;
using SmartCityOps.Domain.Enums;

namespace SmartCityOps.Infrastructure.OperationalTasks.AssignmentRules;

public class FieldUnitAvailabilityRule : ITaskAssignmentRule
{
    public Task<RuleEvaluationResult> EvaluateAsync(TaskAssignmentContext context, CancellationToken cancellationToken)
    {
        var result = context.FieldUnit.Status == FieldUnitStatus.Available
            ? RuleEvaluationResult.Success()
            : RuleEvaluationResult.Failure("Sadece Available durumundaki field unit'ler atanabilir.");

        return Task.FromResult(result);
    }
}
