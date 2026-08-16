import type { FieldUnit } from "../types";
import type { OperationalTask } from "../../operational-tasks/types";
import { useCompleteTask } from "../../operational-tasks/hooks/useCompleteTask";
import { formatEnumLabel } from "../../../shared/lib/formatLabel";

interface FieldUnitPanelProps {
  fieldUnit: FieldUnit | null;
  activeTask: OperationalTask | null;
  onCompleted: () => void;
}

export function FieldUnitPanel({ fieldUnit, activeTask, onCompleted }: FieldUnitPanelProps) {
  const { mutate, isPending, isError } = useCompleteTask();

  if (!fieldUnit) {
    return null;
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
      {fieldUnit.status === "Dispatched" && activeTask && (
        <div>
          <button onClick={handleComplete} disabled={isPending}>
            {isPending ? "Completing..." : "Complete Task"}
          </button>
          {isError && <p>Failed to complete task. Please try again.</p>}
        </div>
      )}
    </div>
  );
}
