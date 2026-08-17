import type { Incident } from "../types";
import { useResolveIncident } from "../hooks/useResolveIncident";
import { formatEnumLabel } from "../../../shared/lib/formatLabel";

interface IncidentPanelProps {
  incident: Incident | null;
  onResolved: () => void;
}

export function IncidentPanel({ incident, onResolved }: IncidentPanelProps) {
  const { mutate, isPending, isError } = useResolveIncident();

  if (!incident) {
    return <div>
      Select an incident point to show details of it.
      Then select a field unit to assign it.<br/>
      Color Blue for Field Units. <br />
      Other colors for Incidents.
    </div>;
  }

  const handleResolve = () => {
    mutate(incident.id, { onSuccess: onResolved });
  };

  return (
    <div>
      <h3>{formatEnumLabel(incident.type)}</h3>
      <p>Priority: {incident.priority}</p>
      <p>Status: {formatEnumLabel(incident.status)}</p>
      <p>Description: {incident.description}</p>
      {incident.status !== "Resolved" && (
        <div>
          <button onClick={handleResolve} disabled={isPending}>
            {isPending ? "Resolving..." : "Resolve Incident"}
          </button>
          {isError && <p>Failed to resolve incident. Please try again.</p>}
        </div>
      )}
    </div>
  );
}
