namespace SmartCityOps.IncidentGenerator;

public class IncidentGeneratorOptions
{
    public required string ApiBaseUrl { get; set; }

    public int IntervalSeconds { get; set; } = 5;
}
