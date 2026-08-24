import { useState } from "react";
import type { FieldUnit } from "../../field-units/types";
import type { OperationalTask } from "../types";
import { useReassignTask } from "../hooks/useReassignTask";
import { formatEnumLabel } from "../../../shared/lib/formatLabel";
import { getErrorMessage } from "../../../shared/lib/getErrorMessage";
import "../styles/ReassignTaskButton.css";
import "../../../shared/styles/buttons.css";

interface ReassignTaskButtonProps {
  task: OperationalTask;
  availableFieldUnits: FieldUnit[];
  onReassigned: () => void;
}

export function ReassignTaskButton({ task, availableFieldUnits, onReassigned }: ReassignTaskButtonProps) {
  const [newFieldUnitId, setNewFieldUnitId] = useState("");
  const { mutate, isPending, isError, error } = useReassignTask();

  if (availableFieldUnits.length === 0) {
    return <p>No available field units to reassign this task to.</p>;
  }

  const handleReassign = () => {
    if (!newFieldUnitId) return;
    mutate(
      { taskId: task.id, newFieldUnitId },
      { onSuccess: onReassigned }
    );
  };

  return (
    <div className="reassign-task-button">
      <select
        value={newFieldUnitId}
        onChange={(event) => setNewFieldUnitId(event.target.value)}
        disabled={isPending}
        aria-label="Select a field unit to reassign this task to"
      >
        <option value="">Select a field unit…</option>
        {availableFieldUnits.map((unit) => (
          <option key={unit.id} value={unit.id}>
            {formatEnumLabel(unit.type)} ({unit.unitCode})
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={handleReassign}
        disabled={!newFieldUnitId || isPending}
        className="app-button"
      >
        {isPending ? "Reassigning..." : "Reassign Task"}
      </button>
      {isError && <p>{getErrorMessage(error, "Failed to reassign task. Please try again.")}</p>}
    </div>
  );
}
