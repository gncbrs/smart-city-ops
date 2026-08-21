import type { Incident } from "../../incidents/types";
import type { FieldUnit } from "../../field-units/types";
import type { OperationalTask } from "../../operational-tasks/types";
import { getFieldUnitLabel, getIncidentLabel, MANUAL_RESOLVE_UNIT_LABEL } from "./describeTask";
import type { HistoryTableCell } from "../../../shared/components/HistoryTable";

export interface TaskHistoryRow {
  id: string;
  cells: HistoryTableCell[];
  timestamp: string;
}

function buildTaskCells(
  task: OperationalTask,
  fieldUnits: FieldUnit[],
  incidents: Incident[],
  onSelectFieldUnit: (fieldUnit: FieldUnit) => void,
  onSelectIncident: (incident: Incident) => void
): HistoryTableCell[] {
  const fieldUnit = fieldUnits.find((unit) => unit.id === task.fieldUnitId);
  const incident = incidents.find((item) => item.id === task.incidentId);

  return [
    {
      label: getFieldUnitLabel(fieldUnit),
      onClick: fieldUnit ? () => onSelectFieldUnit(fieldUnit) : undefined,
    },
    {
      label: getIncidentLabel(incident),
      onClick: incident ? () => onSelectIncident(incident) : undefined,
    },
  ];
}

export function buildActiveTaskRows(
  operationalTasks: OperationalTask[],
  fieldUnits: FieldUnit[],
  incidents: Incident[],
  onSelectFieldUnit: (fieldUnit: FieldUnit) => void,
  onSelectIncident: (incident: Incident) => void
): TaskHistoryRow[] {
  return operationalTasks
    .filter((task) => task.status === "Assigned")
    .map((task) => ({
      id: task.id,
      cells: [
        ...buildTaskCells(task, fieldUnits, incidents, onSelectFieldUnit, onSelectIncident),
        { label: new Date(task.assignedAt).toLocaleString() },
      ],
      timestamp: task.assignedAt,
    }))
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function buildCompletedHistoryRows(
  operationalTasks: OperationalTask[],
  fieldUnits: FieldUnit[],
  incidents: Incident[],
  onSelectFieldUnit: (fieldUnit: FieldUnit) => void,
  onSelectIncident: (incident: Incident) => void
): TaskHistoryRow[] {
  const completedTaskRows: TaskHistoryRow[] = operationalTasks
    .filter((task) => task.status === "Completed" && task.completedAt)
    .map((task) => ({
      id: task.id,
      cells: [
        ...buildTaskCells(task, fieldUnits, incidents, onSelectFieldUnit, onSelectIncident),
        { label: new Date(task.completedAt as string).toLocaleString() },
      ],
      timestamp: task.completedAt as string,
    }));

  const incidentIdsWithTasks = new Set(operationalTasks.map((task) => task.incidentId));

  const manualResolveRows: TaskHistoryRow[] = incidents
    .filter(
      (incident) =>
        incident.status === "Resolved" &&
        incident.resolvedAt &&
        !incidentIdsWithTasks.has(incident.id)
    )
    .map((incident) => ({
      id: incident.id,
      cells: [
        { label: MANUAL_RESOLVE_UNIT_LABEL },
        { label: getIncidentLabel(incident), onClick: () => onSelectIncident(incident) },
        { label: new Date(incident.resolvedAt as string).toLocaleString() },
      ],
      timestamp: incident.resolvedAt as string,
    }));

  return [...completedTaskRows, ...manualResolveRows].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}
