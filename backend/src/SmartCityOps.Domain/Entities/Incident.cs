using SmartCityOps.Domain.Common;
using SmartCityOps.Domain.Enums;

namespace SmartCityOps.Domain.Entities;

public class Incident : BaseEntity
{
    public string IncidentCode { get; set; } = string.Empty;
    public IncidentType Type { get; set; }
    public IncidentPriority Priority { get; set; }
    public IncidentStatus Status { get; set; }
    public DateTimeOffset ReportedAt { get; set; }
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public string Description { get; set; } = string.Empty;
}
