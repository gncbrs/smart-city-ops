import type { OperationalTask } from "../../features/operational-tasks/types";
import type { FieldUnit } from "../../features/field-units/types";
import type { Incident } from "../../features/incidents/types";

export function getActiveTaskForFieldUnit(
  fieldUnitId: string | undefined,
  operationalTasks: OperationalTask[]
): OperationalTask | undefined {
  return operationalTasks.find(
    (task) => task.fieldUnitId === fieldUnitId && task.status === "Assigned"
  );
}

export function getTasksForIncident(
  incidentId: string | undefined,
  operationalTasks: OperationalTask[]
): OperationalTask[] {
  return operationalTasks.filter((task) => task.incidentId === incidentId);
}

export function getAvailableFieldUnits(fieldUnits: FieldUnit[]): FieldUnit[] {
  return fieldUnits.filter((fieldUnit) => fieldUnit.status === "Available");
}

export function getSelectedIncident(
  selectedId: string | null,
  incidents: Incident[]
): Incident | null {
  if (!selectedId) return null;
  return incidents.find((incident) => incident.id === selectedId) ?? null;
}

export function getSelectedFieldUnit(
  selectedId: string | null,
  fieldUnits: FieldUnit[]
): FieldUnit | null {
  if (!selectedId) return null;
  return fieldUnits.find((fieldUnit) => fieldUnit.id === selectedId) ?? null;
}
