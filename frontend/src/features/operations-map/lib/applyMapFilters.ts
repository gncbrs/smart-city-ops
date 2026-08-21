import type { Incident, IncidentPriority } from "../../incidents/types";
import type { FieldUnit, FieldUnitStatus, FieldUnitType } from "../../field-units/types";

export function filterIncidentsForMap(
  incidents: Incident[],
  priorityFilter: IncidentPriority[]
): Incident[] {
  return incidents.filter(
    (incident) => priorityFilter.length === 0 || priorityFilter.includes(incident.priority)
  );
}

export function filterFieldUnitsForMap(
  fieldUnits: FieldUnit[],
  statusFilter: FieldUnitStatus[],
  typeFilter: FieldUnitType[]
): FieldUnit[] {
  return fieldUnits.filter((unit) => {
    const statusMatches = statusFilter.length === 0 || statusFilter.includes(unit.status);
    const typeMatches = typeFilter.length === 0 || typeFilter.includes(unit.type);
    return statusMatches && typeMatches;
  });
}