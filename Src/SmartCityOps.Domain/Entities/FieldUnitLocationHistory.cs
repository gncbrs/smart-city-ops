using SmartCityOps.Domain.Common;

namespace SmartCityOps.Domain.Entities;

public class FieldUnitLocationHistory : EntityBase
{
    public Guid FieldUnitId { get; set; }
    public Guid? IncidentId { get; set; }
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public DateTimeOffset RecordedAt { get; set; }
}