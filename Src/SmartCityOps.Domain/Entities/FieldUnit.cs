using SmartCityOps.Domain.Common;
using SmartCityOps.Domain.Enums;

namespace SmartCityOps.Domain.Entities;

public class FieldUnit : EntityBase
{
    public string UnitCode { get; set; } = string.Empty;
    public FieldUnitType Type { get; set; }
    public FieldUnitStatus Status { get; set; }
    public double Latitude { get; set; }
    public double Longitude { get; set; }
}