import type { Incident } from "../types";
import type { FieldUnit } from "../../field-units/types";
import type { OperationalTask } from "../../operational-tasks/types";
import { useResolveIncident } from "../hooks/useResolveIncident";
import { formatEnumLabel } from "../../../shared/lib/formatLabel";
import { getFieldUnitLabel, MANUAL_RESOLVE_UNIT_LABEL } from "../../operational-tasks/lib/describeTask";
import { HistoryTable, type HistoryTableRow } from "../../../shared/components/HistoryTable";

interface IncidentPanelProps {
  incident: Incident | null;
  operationalTasks: OperationalTask[];
  fieldUnits: FieldUnit[];
  onResolved: () => void;
  onSelectFieldUnit: (fieldUnit: FieldUnit) => void;
}

export function IncidentPanel({
  incident,
  operationalTasks,
  fieldUnits,
  onResolved,
  onSelectFieldUnit,
}: IncidentPanelProps) {
  const { mutate, isPending, isError } = useResolveIncident();

  if (!incident) {
    return <div>
      Select an incident point to show details of it.
      Then select a field unit to assign it.<br/>
      Color Blue for Field Units. <br />
      Other colors for Incidents.
    </div>;
  }

  const handleResolve = () => {
    mutate(incident.id, { onSuccess: onResolved });
  };

  const incidentTasks = operationalTasks
    .filter((task) => task.incidentId === incident.id)
    .sort((a, b) => new Date(b.assignedAt).getTime() - new Date(a.assignedAt).getTime());

  const wasResolvedWithoutTask = incident.status === "Resolved" && incidentTasks.length === 0;

  const historyRows: HistoryTableRow[] = incidentTasks.map((task) => {
    const fieldUnit = fieldUnits.find((unit) => unit.id === task.fieldUnitId);

    return {
      id: task.id,
      cells: [
        { label: getFieldUnitLabel(fieldUnit), onClick: fieldUnit ? () => onSelectFieldUnit(fieldUnit) : undefined },
        { label: formatEnumLabel(task.status) },
        { label: new Date(task.assignedAt).toLocaleString() },
        { label: task.completedAt ? new Date(task.completedAt).toLocaleString() : "—" },
      ],
    };
  });

  if (wasResolvedWithoutTask && incident.resolvedAt) {
    historyRows.push({
      id: incident.id,
      cells: [
        { label: MANUAL_RESOLVE_UNIT_LABEL },
        { label: "Resolved" },
        { label: "—" },
        { label: new Date(incident.resolvedAt).toLocaleString() },
      ],
    });
  }

  return (
    <div>
      <h3>{formatEnumLabel(incident.type)}</h3>
      <p>Priority: {incident.priority}</p>
      <p>Status: {formatEnumLabel(incident.status)}</p>
      <p>Description: {incident.description}</p>
      {incident.status !== "Resolved" && (
        <div>
          <button onClick={handleResolve} disabled={isPending}>
            {isPending ? "Resolving..." : "Resolve Incident"}
          </button>
          {isError && <p>Failed to resolve incident. Please try again.</p>}
        </div>
      )}

      <h4>History</h4>
      <HistoryTable
        columns={["Unit", "Status", "Assigned At", "Completed At"]}
        rows={historyRows}
        emptyMessage="No tasks assigned yet."
      />
    </div>
  );
}