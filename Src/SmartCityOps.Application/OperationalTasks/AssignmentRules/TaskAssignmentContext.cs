using SmartCityOps.Domain.Entities;

namespace SmartCityOps.Application.OperationalTasks.AssignmentRules;

public record TaskAssignmentContext(Incident Incident, FieldUnit FieldUnit);
