import type { Incident } from "../../incidents/types";
import type { FieldUnit } from "../../field-units/types";
import type { OperationalTask } from "../../operational-tasks/types";
import {
  getFieldUnitLabel,
  getIncidentLabel,
  MANUAL_RESOLVE_UNIT_LABEL,
} from "../../operational-tasks/lib/describeTask";
import { HistoryTable, type HistoryTableCell } from "../../../shared/components/HistoryTable";

interface CompletedTasksSectionProps {
  incidents: Incident[];
  fieldUnits: FieldUnit[];
  operationalTasks: OperationalTask[];
  onSelectIncident: (incident: Incident) => void;
  onSelectFieldUnit: (fieldUnit: FieldUnit) => void;
}

interface HistoryRow {
  id: string;
  cells: HistoryTableCell[];
  timestamp: string;
}

export function CompletedTasksSection({
  incidents,
  fieldUnits,
  operationalTasks,
  onSelectIncident,
  onSelectFieldUnit,
}: CompletedTasksSectionProps) {
  const buildTaskCells = (task: OperationalTask): HistoryTableCell[] => {
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
  };

  const completedTaskRows: HistoryRow[] = operationalTasks
    .filter((task) => task.status === "Completed" && task.completedAt)
    .map((task) => ({
      id: task.id,
      cells: [...buildTaskCells(task), { label: new Date(task.completedAt as string).toLocaleString() }],
      timestamp: task.completedAt as string,
    }));

  const incidentIdsWithTasks = new Set(operationalTasks.map((task) => task.incidentId));

  const manualResolveRows: HistoryRow[] = incidents
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

  const completedHistoryRows = [...completedTaskRows, ...manualResolveRows].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div>
      <h3>Completed Tasks ({completedHistoryRows.length})</h3>
      <HistoryTable
        columns={["Unit", "Incident", "Completed At"]}
        rows={completedHistoryRows}
        emptyMessage="No completed tasks yet."
      />
    </div>
  );
}