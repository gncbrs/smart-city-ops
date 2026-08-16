import { useState } from "react";
import { OperationsCenterLayout } from "../layouts/OperationsCenterLayout";
import { IncidentPanel } from "../features/incidents/components/IncidentPanel";
import { IncidentsSummary } from "../features/incidents/components/IncidentsSummary";
import { useIncidents } from "../features/incidents/hooks/useIncidents";
import { useFieldUnits } from "../features/field-units/hooks/useFieldUnits";
import { FieldUnitPanel } from "../features/field-units/components/FieldUnitPanel";
import { AssignTaskButton } from "../features/operational-tasks/components/AssignTaskButton";
import { useOperationalTasks } from "../features/operational-tasks/hooks/useOperationalTasks";
import { Dashboard } from "../features/dashboard/components/Dashboard";
import { OperationsMap } from "../features/operations-map/components/OperationsMap";
//import { useSignalRConnection } from "../shared/hooks/useSignalR";
import type { Incident } from "../features/incidents/types";
import type { FieldUnit } from "../features/field-units/types";

export function App() {
  //useSignalRConnection();

  const { data: incidents } = useIncidents();
  const { data: fieldUnits } = useFieldUnits();
  const { data: operationalTasks } = useOperationalTasks();
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [selectedFieldUnit, setSelectedFieldUnit] = useState<FieldUnit | null>(null);

  const clearSelection = () => {
    setSelectedIncident(null);
    setSelectedFieldUnit(null);
  };

  const activeTaskForSelectedFieldUnit =
    operationalTasks?.find(
      (task) => task.fieldUnitId === selectedFieldUnit?.id && task.status === "Assigned"
    ) ?? null;

  return (
    <OperationsCenterLayout
      map={
        <OperationsMap
          incidents={incidents ?? []}
          fieldUnits={fieldUnits ?? []}
          onSelectIncident={setSelectedIncident}
          onSelectFieldUnit={setSelectedFieldUnit}
        />
      }
      sidePanel={
        <>
          <IncidentsSummary count={incidents?.length ?? 0} />
          <Dashboard
            incidents={incidents ?? []}
            fieldUnits={fieldUnits ?? []}
            operationalTasks={operationalTasks ?? []}
          />
          <IncidentPanel incident={selectedIncident} onResolved={clearSelection} />
          <FieldUnitPanel
            fieldUnit={selectedFieldUnit}
            activeTask={activeTaskForSelectedFieldUnit}
            onCompleted={clearSelection}
          />
          {selectedIncident && selectedFieldUnit && (
            <AssignTaskButton
              incident={selectedIncident}
              fieldUnit={selectedFieldUnit}
              onAssigned={clearSelection}
            />
          )}
        </>
      }
    />
  );
}