namespace SmartCityOps.Application.OperationalTasks.AssignmentRules;

public record RuleEvaluationResult(bool IsSatisfied, string? FailureReason)
{
    public static RuleEvaluationResult Success() => new(true, null);

    public static RuleEvaluationResult Failure(string reason) => new(false, reason);
}
