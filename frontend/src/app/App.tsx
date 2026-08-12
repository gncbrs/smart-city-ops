import { useState } from "react";
import { OperationsCenterLayout } from "../layouts/OperationsCenterLayout";
import { IncidentPanel } from "../features/incidents/components/IncidentPanel";
import { useIncidents } from "../features/incidents/hooks/useIncidents";
import { useSignalRConnection } from "../shared/hooks/useSignalR";
import type { Incident } from "../features/incidents/types";

export function App() {
  useSignalRConnection();

  const { data: incidents } = useIncidents();
  const [selectedIncident] = useState<Incident | null>(null);

  return (
    <OperationsCenterLayout
      sidePanel={
        <>
          <p>Toplam incident: {incidents?.length ?? 0}</p>
          <IncidentPanel incident={selectedIncident} />
        </>
      }
    />
  );
}
