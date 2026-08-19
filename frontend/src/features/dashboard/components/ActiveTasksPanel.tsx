import type { Incident } from "../../incidents/types";
import type { FieldUnit } from "../../field-units/types";
import type { OperationalTask } from "../../operational-tasks/types";
import { getFieldUnitLabel, getIncidentLabel } from "../../operational-tasks/lib/describeTask";
import { HistoryTable, type HistoryTableCell, type HistoryTableRow } from "../../../shared/components/HistoryTable";

interface ActiveTasksPanelProps {
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

export function ActiveTasksPanel({
  incidents,
  fieldUnits,
  operationalTasks,
  onSelectIncident,
  onSelectFieldUnit,
}: ActiveTasksPanelProps) {
  const assignedIncidentIds = new Set(
    operationalTasks.filter((task) => task.status === "Assigned").map((task) => task.incidentId)
  );

  const readyToResolveRows: HistoryTableRow[] = incidents
    .filter((incident) => incident.status === "InProgress" && !assignedIncidentIds.has(incident.id))
    .map((incident) => ({
      id: incident.id,
      cells: [{ label: getIncidentLabel(incident), onClick: () => onSelectIncident(incident) }],
    }));

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

  const activeTaskRows: HistoryRow[] = operationalTasks
    .filter((task) => task.status === "Assigned")
    .map((task) => ({
      id: task.id,
      cells: [...buildTaskCells(task), { label: new Date(task.assignedAt).toLocaleString() }],
      timestamp: task.assignedAt,
    }))
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div>
      <h3>Active Tasks ({activeTaskRows.length})</h3>
      <HistoryTable
        columns={["Unit", "Incident", "Assigned At"]}
        rows={activeTaskRows}
        emptyMessage="No active tasks."
      />

      {readyToResolveRows.length > 0 && (
        <>
          <h3>Ready to Resolve ({readyToResolveRows.length})</h3>
          <HistoryTable
            columns={["Incident"]}
            rows={readyToResolveRows}
            emptyMessage="No incidents ready to resolve."
          />
        </>
      )}
    </div>
  );
}