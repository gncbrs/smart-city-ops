import type { Incident } from "../../features/incidents/types";
import type { FieldUnit } from "../../features/field-units/types";
import type { OperationalTask } from "../../features/operational-tasks/types";
import { FieldUnitPanel } from "../../features/field-units/components/FieldUnitPanel";
import { AssignTaskButton } from "../../features/operational-tasks/components/AssignTaskButton";

interface FieldUnitColumnProps {
  selectedIncident: Incident | null;
  selectedFieldUnit: FieldUnit | null;
  activeTask: OperationalTask | null;
  availableFieldUnitsForReassignment: FieldUnit[];
  onCompleted: () => void;
  onAssigned: () => void;
  onReassigned: () => void;
  onViewMovementHistory: () => void;
  readOnly?: boolean;
}

export function FieldUnitColumn({
  selectedIncident,
  selectedFieldUnit,
  activeTask,
  availableFieldUnitsForReassignment,
  onCompleted,
  onAssigned,
  onReassigned,
  onViewMovementHistory,
  readOnly = false,
}: FieldUnitColumnProps) {
  return (
    <>
      <FieldUnitPanel
        fieldUnit={selectedFieldUnit}
        activeTask={activeTask}
        availableFieldUnitsForReassignment={availableFieldUnitsForReassignment}
        onCompleted={onCompleted}
        onReassigned={onReassigned}
        onViewMovementHistory={onViewMovementHistory}
        readOnly={readOnly}
      />
      {!readOnly && selectedIncident && selectedFieldUnit && (
        <AssignTaskButton
          incident={selectedIncident}
          fieldUnit={selectedFieldUnit}
          onAssigned={onAssigned}
        />
      )}
    </>
  );
}