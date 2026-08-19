import type { Incident } from "../../incidents/types";
import type { FieldUnit } from "../../field-units/types";
import { useCreateTask } from "../hooks/useCreateTask";
import "../styles/AssignTaskButton.css";

interface AssignTaskButtonProps {
  incident: Incident;
  fieldUnit: FieldUnit;
  onAssigned: () => void;
}

export function AssignTaskButton({ incident, fieldUnit, onAssigned }: AssignTaskButtonProps) {
  const { mutate, isPending, isError } = useCreateTask();

  const isFieldUnitAvailable = fieldUnit.status === "Available";
  const isIncidentResolved = incident.status === "Resolved";
  const canAssign = isFieldUnitAvailable && !isIncidentResolved;

  const handleClick = () => {
    mutate(
      { incidentId: incident.id, fieldUnitId: fieldUnit.id },
      { onSuccess: onAssigned }
    );
  };

  return (
    <div>
      <button onClick={handleClick} disabled={!canAssign || isPending} className="assign-task-button">
        {isPending ? "Assigning..." : "Assign Task"}
      </button>
      {!isFieldUnitAvailable && <p>{fieldUnit.unitCode} is not available for assignment.</p>}
      {isIncidentResolved && <p>This incident is already resolved.</p>}
      {isError && <p>Failed to assign task. Please try again.</p>}
    </div>
  );
}
