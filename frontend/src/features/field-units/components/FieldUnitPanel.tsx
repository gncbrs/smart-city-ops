import type { FieldUnit } from "../types";
import type { OperationalTask } from "../../operational-tasks/types";
import { useCompleteTask } from "../../operational-tasks/hooks/useCompleteTask";
import { useUpdateFieldUnitStatus } from "../hooks/useUpdateFieldUnitStatus";
import { ReassignTaskButton } from "../../operational-tasks/components/ReassignTaskButton";
import { formatEnumLabel } from "../../../shared/lib/formatLabel";
import "../styles/FieldUnitPanel.css";
import "../../../shared/styles/buttons.css";

interface FieldUnitPanelProps {
  fieldUnit: FieldUnit | null;
  activeTask: OperationalTask | null;
  availableFieldUnitsForReassignment: FieldUnit[];
  onCompleted: () => void;
  onReassigned: () => void;
  onViewMovementHistory: () => void;
  onClose: () => void;
  readOnly?: boolean;
}

export function FieldUnitPanel({
  fieldUnit,
  activeTask,
  availableFieldUnitsForReassignment,
  onCompleted,
  onReassigned,
  onViewMovementHistory,
  onClose,
  readOnly = false,
}: FieldUnitPanelProps) {
  const { mutate, isPending, isError } = useCompleteTask();
  const { mutate: mutateStatus, isPending: isStatusUpdating } = useUpdateFieldUnitStatus();

  if (!fieldUnit) {
    return <p>Select a field unit on the map to see details here.</p>;
  }

  const handleComplete = () => {
    if (!activeTask) return;
    mutate(activeTask.id, { onSuccess: onCompleted });
  };

  const handleSetStatus = (status: "Available" | "OutOfService") => {
    mutateStatus({ id: fieldUnit.id, status });
  };

  return (
    <div className="field-unit-panel">
      <button
        type="button"
        className="field-unit-panel__close"
        onClick={onClose}
        aria-label="Deselect field unit"
        title="Deselect field unit"
      >
        ✕
      </button>
      <h3>{formatEnumLabel(fieldUnit.type)}</h3>
      <p>Unit Code: {fieldUnit.unitCode}</p>
      <p>Status: {formatEnumLabel(fieldUnit.status)}</p>

      <div className="field-unit-panel__actions">
        <button type="button" onClick={onViewMovementHistory} className="app-button">
          View Movement History
        </button>
        {!readOnly && fieldUnit.status === "Dispatched" && activeTask && (
          <button onClick={handleComplete} disabled={isPending} className="app-button">
            {isPending ? "Completing..." : "Complete Task"}
          </button>
        )}
        {!readOnly && fieldUnit.status === "Available" && (
          <button onClick={() => handleSetStatus("OutOfService")} disabled={isStatusUpdating} className="app-button">
            {isStatusUpdating ? "Updating..." : "Set Out of Service"}
          </button>
        )}
        {!readOnly && fieldUnit.status === "OutOfService" && (
          <button onClick={() => handleSetStatus("Available")} disabled={isStatusUpdating} className="app-button">
            {isStatusUpdating ? "Updating..." : "Set Available"}
          </button>
        )}
      </div>

      {!readOnly && isError && <p>Failed to complete task. Please try again.</p>}

      {readOnly && <p>Historical snapshot — actions disabled.</p>}

      {!readOnly && fieldUnit.status === "Dispatched" && activeTask && (
        <ReassignTaskButton
          task={activeTask}
          availableFieldUnits={availableFieldUnitsForReassignment}
          onReassigned={onReassigned}
        />
      )}
    </div>
  );
}