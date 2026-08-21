import type { Incident } from "../../features/incidents/types";
import type { FieldUnit } from "../../features/field-units/types";
import type { OperationalTask } from "../../features/operational-tasks/types";
import { FieldUnitPanel } from "../../features/field-units/components/FieldUnitPanel";
import { AssignTaskButton } from "../../features/operational-tasks/components/AssignTaskButton";

interface FieldUnitColumnProps {
  selectedIncident: Incident | null;
  selectedFieldUnit: FieldUnit | null;
  activeTask: OperationalTask | null;
  onCompleted: () => void;
  onAssigned: () => void;
  onViewMovementHistory: () => void;
}

export function FieldUnitColumn({
  selectedIncident,
  selectedFieldUnit,
  activeTask,
  onCompleted,
  onAssigned,
  onViewMovementHistory,
}: FieldUnitColumnProps) {
  return (
    <>
      <FieldUnitPanel
        fieldUnit={selectedFieldUnit}
        activeTask={activeTask}
        onCompleted={onCompleted}
        onViewMovementHistory={onViewMovementHistory}
      />
      {selectedIncident && selectedFieldUnit && (
        <AssignTaskButton
          incident={selectedIncident}
          fieldUnit={selectedFieldUnit}
          onAssigned={onAssigned}
        />
      )}
    </>
  );
}