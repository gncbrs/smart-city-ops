import { useState } from "react";
import { OperationsCenterLayout } from "../layouts/OperationsCenterLayout";
import { IncidentPanel } from "../features/incidents/components/IncidentPanel";
import { useIncidents } from "../features/incidents/hooks/useIncidents";
import { OperationsMap } from "../features/operations-map/components/OperationsMap";
import { useSignalRConnection } from "../shared/hooks/useSignalR";
import type { Incident } from "../features/incidents/types";

export function App() {
  useSignalRConnection();

  const { data: incidents } = useIncidents();
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  return (
    <OperationsCenterLayout
      map={<OperationsMap incidents={incidents ?? []} onSelectIncident={setSelectedIncident} />}
      sidePanel={
        <>
          <p>Toplam incident: {incidents?.length ?? 0}</p>
          <IncidentPanel incident={selectedIncident} />
        </>
      }
    />
  );
}
