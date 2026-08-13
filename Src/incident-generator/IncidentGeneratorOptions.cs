namespace SmartCityOps.IncidentGenerator;

public class IncidentGenerator
{
    // TODO -- SHOULD BE ONE LINERS 
    public required string ApiBaseUrl
    {
        get; set;
    }

    public int IntervalSeconds { get; set; } = 15;
}