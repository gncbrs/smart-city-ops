import { useState } from "react";
import { OperationsCenterLayout } from "../layouts/OperationsCenterLayout";
import { IncidentPanel } from "../features/incidents/components/IncidentPanel";
import { IncidentsSummary } from "../features/incidents/components/IncidentsSummary";
import { useIncidents } from "../features/incidents/hooks/useIncidents";
import { useFieldUnits } from "../features/field-units/hooks/useFieldUnits";  
import { OperationsMap } from "../features/operations-map/components/OperationsMap";
import { useSignalRConnection } from "../shared/hooks/useSignalR";
import type { Incident } from "../features/incidents/types";

export function App() {
  useSignalRConnection();

  const { data: incidents } = useIncidents();
  const { data: fieldUnits } = useFieldUnits();               
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  return (
    <OperationsCenterLayout
      map={
        <OperationsMap
          incidents={incidents ?? []}
          fieldUnits={fieldUnits ?? []}                     
          onSelectIncident={setSelectedIncident}
        />
      }
      sidePanel={
        <>
          <IncidentsSummary count={incidents?.length ?? 0} />
          <IncidentPanel incident={selectedIncident} />
        </>
      }
    />
  );
}