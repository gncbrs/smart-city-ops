using SmartCityOps.Domain.Enums;

namespace SmartCityOps.Domain.Entities;

public class FieldUnitStatusHistory
{
    public Guid Id { get; private set; }
    public Guid FieldUnitId { get; private set; }
    public FieldUnitStatus Status { get; private set; }
    public DateTimeOffset ChangedAt { get; private set; }
    public string? Reason { get; private set; }

    private FieldUnitStatusHistory() { }

    public FieldUnitStatusHistory(Guid id, Guid fieldUnitId, FieldUnitStatus status, DateTimeOffset changedAt, string? reason = null)
    {
        Id = id;
        FieldUnitId = fieldUnitId;
        Status = status;
        ChangedAt = changedAt;
        Reason = reason;
    }
}
