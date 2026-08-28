namespace SmartCityOps.Application.FieldUnits;

public record UpdateFieldUnitStatusDto(
    string Status,
    string? Reason = null
);
