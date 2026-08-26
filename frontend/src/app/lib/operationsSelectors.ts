import type { OperationalTask } from "../../features/operational-tasks/types";
import type { FieldUnit } from "../../features/field-units/types";

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
