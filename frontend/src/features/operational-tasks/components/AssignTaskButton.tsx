import type { Incident } from "../../incidents/types";
import type { FieldUnit } from "../../field-units/types";
import { useCreateTask } from "../hooks/useCreateTask";

interface AssignTaskButtonProps {
  incident: Incident;
  fieldUnit: FieldUnit;
  onAssigned: () => void;
}

export function AssignTaskButton({ incident, fieldUnit, onAssigned }: AssignTaskButtonProps) {
  const { mutate, isPending, isError } = useCreateTask();

  const isAvailable = fieldUnit.status === "Available";

  const handleClick = () => {
    mutate(
      { incidentId: incident.id, fieldUnitId: fieldUnit.id },
      { onSuccess: onAssigned }
    );
  };

  return (
    <div>
      <button onClick={handleClick} disabled={!isAvailable || isPending}>
        {isPending ? "Assigning..." : "Assign Task"}
      </button>
      {!isAvailable && <p>{fieldUnit.unitCode} is not available for assignment.</p>}
      {isError && <p>Failed to assign task. Please try again.</p>}
    </div>
  );
}
