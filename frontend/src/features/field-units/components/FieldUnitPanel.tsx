import type { FieldUnit } from "../types";
import type { OperationalTask } from "../../operational-tasks/types";
import { useCompleteTask } from "../../operational-tasks/hooks/useCompleteTask";
import { formatEnumLabel } from "../../../shared/lib/formatLabel";
import "../styles/FieldUnitPanel.css";

interface FieldUnitPanelProps {
  fieldUnit: FieldUnit | null;
  activeTask: OperationalTask | null;
  onCompleted: () => void;
  onViewMovementHistory: () => void;
}

export function FieldUnitPanel({ fieldUnit, activeTask, onCompleted, onViewMovementHistory }: FieldUnitPanelProps) {
  const { mutate, isPending, isError } = useCompleteTask();

  if (!fieldUnit) {
    return <p>Select a field unit on the map to see details here.</p>;
  }

  const handleComplete = () => {
    if (!activeTask) return;
    mutate(activeTask.id, { onSuccess: onCompleted });
  };

  return (
    <div>
      <h3>{formatEnumLabel(fieldUnit.type)}</h3>
      <p>Unit Code: {fieldUnit.unitCode}</p>
      <p>Status: {formatEnumLabel(fieldUnit.status)}</p>

      <div className="field-unit-panel__actions">
        <button type="button" onClick={onViewMovementHistory} className="view-movement-history-button">
          View Movement History
        </button>
        {fieldUnit.status === "Dispatched" && activeTask && (
          <button onClick={handleComplete} disabled={isPending} className="complete-task-button">
            {isPending ? "Completing..." : "Complete Task"}
          </button>
        )}
      </div>

      {isError && <p>Failed to complete task. Please try again.</p>}
    </div>
  );
}