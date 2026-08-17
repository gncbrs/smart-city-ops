import type { FieldUnit } from "../types";
import type { Incident } from "../../incidents/types";
import type { OperationalTask } from "../../operational-tasks/types";
import { useCompleteTask } from "../../operational-tasks/hooks/useCompleteTask";
import { formatEnumLabel } from "../../../shared/lib/formatLabel";
import { getIncidentLabel } from "../../operational-tasks/lib/describeTask";
import { HistoryTable, type HistoryTableRow } from "../../../shared/components/HistoryTable";

interface FieldUnitPanelProps {
  fieldUnit: FieldUnit | null;
  activeTask: OperationalTask | null;
  operationalTasks: OperationalTask[];
  incidents: Incident[];
  onCompleted: () => void;
  onSelectIncident: (incident: Incident) => void;
}

export function FieldUnitPanel({
  fieldUnit,
  activeTask,
  operationalTasks,
  incidents,
  onCompleted,
  onSelectIncident,
}: FieldUnitPanelProps) {
  const { mutate, isPending, isError } = useCompleteTask();

  if (!fieldUnit) {
    return null;
  }

  const handleComplete = () => {
    if (!activeTask) return;
    mutate(activeTask.id, { onSuccess: onCompleted });
  };

  const unitTasks = operationalTasks
    .filter((task) => task.fieldUnitId === fieldUnit.id)
    .sort((a, b) => new Date(b.assignedAt).getTime() - new Date(a.assignedAt).getTime());

  const historyRows: HistoryTableRow[] = unitTasks.map((task) => {
    const incident = incidents.find((item) => item.id === task.incidentId);

    return {
      id: task.id,
      cells: [
        { label: getIncidentLabel(incident), onClick: incident ? () => onSelectIncident(incident) : undefined },
        { label: formatEnumLabel(task.status) },
        { label: new Date(task.assignedAt).toLocaleString() },
        { label: task.completedAt ? new Date(task.completedAt).toLocaleString() : "—" },
      ],
    };
  });

  return (
    <div>
      <h3>{formatEnumLabel(fieldUnit.type)}</h3>
      <p>Unit Code: {fieldUnit.unitCode}</p>
      <p>Status: {formatEnumLabel(fieldUnit.status)}</p>
      {fieldUnit.status === "Dispatched" && activeTask && (
        <div>
          <button onClick={handleComplete} disabled={isPending}>
            {isPending ? "Completing..." : "Complete Task"}
          </button>
          {isError && <p>Failed to complete task. Please try again.</p>}
        </div>
      )}

      <h4>History</h4>
      <HistoryTable
        columns={["Incident", "Status", "Assigned At", "Completed At"]}
        rows={historyRows}
        emptyMessage="No tasks assigned yet."
      />
    </div>
  );
}
