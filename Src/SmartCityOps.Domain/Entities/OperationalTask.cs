using SmartCityOps.Domain.Common;
using SmartCityOps.Domain.Enums;

namespace SmartCityOps.Domain.Entities;

public class OperationalTask : EntityBase
{
    public Guid IncidentId { get; set; }
    public Guid FieldUnitId { get; set; }
    public OperationalTaskStatus Status { get; set; }
    public DateTimeOffset AssignedAt { get; set; }
    public DateTimeOffset? CompletedAt { get; set; }
    public double? OriginLatitude { get; set; }
    public double? OriginLongitude { get; set; }
    public int? EstimatedEtaSeconds { get; set; }
}