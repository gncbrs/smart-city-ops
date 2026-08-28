using SmartCityOps.Domain.Enums;

namespace SmartCityOps.Application.Incidents;

public static class IncidentPriorityScoreCalculator
{
    private const int MaxAgeBonus = 30;

    public static int Calculate(IncidentPriority priority, DateTimeOffset reportedAt, DateTimeOffset now)
    {
        var baseScore = priority switch
        {
            IncidentPriority.High => 70,
            IncidentPriority.Medium => 40,
            IncidentPriority.Low => 10,
            _ => 0
        };

        var ageMinutes = (now - reportedAt).TotalMinutes;
        var ageBonus = (int)Math.Clamp(ageMinutes, 0, MaxAgeBonus);

        return Math.Clamp(baseScore + ageBonus, 0, 100);
    }
}
