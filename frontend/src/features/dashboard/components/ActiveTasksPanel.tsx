import type { Incident } from "../../incidents/types";
import type { FieldUnit } from "../../field-units/types";
import type { OperationalTask } from "../../operational-tasks/types";
import { getIncidentLabel } from "../../operational-tasks/lib/describeTask";
import { buildActiveTaskRows } from "../../operational-tasks/lib/buildTaskRow";
import { HistoryTable, type HistoryTableRow } from "../../../shared/components/HistoryTable";

interface ActiveTasksPanelProps {
  incidents: Incident[];
  fieldUnits: FieldUnit[];
  operationalTasks: OperationalTask[];
  onSelectIncident: (incident: Incident) => void;
  onSelectFieldUnit: (fieldUnit: FieldUnit) => void;
}

export function ActiveTasksPanel({
  incidents,
  fieldUnits,
  operationalTasks,
  onSelectIncident,
  onSelectFieldUnit,
}: ActiveTasksPanelProps) {
  const readyToResolveRows: HistoryTableRow[] = incidents
    .filter((incident) => incident.status === "InProgress" && incident.isReadyToResolve)
    .map((incident) => ({
      id: incident.id,
      cells: [{ label: getIncidentLabel(incident), onClick: () => onSelectIncident(incident) }],
    }));

  const activeTaskRows = buildActiveTaskRows(
    operationalTasks,
    fieldUnits,
    incidents,
    onSelectFieldUnit,
    onSelectIncident
  );

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