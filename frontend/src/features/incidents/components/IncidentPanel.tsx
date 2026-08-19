import type { Incident } from "../types";
import { useResolveIncident } from "../hooks/useResolveIncident";
import { formatEnumLabel } from "../../../shared/lib/formatLabel";
import "../styles/IncidentPanel.css";

interface IncidentPanelProps {
  incident: Incident | null;
  onResolved: () => void;
}

export function IncidentPanel({ incident, onResolved }: IncidentPanelProps) {
  const { mutate, isPending, isError } = useResolveIncident();

  if (!incident) {
    return <p>Select an incident on the map to see details here.</p>;
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
          <button onClick={handleResolve} disabled={isPending} className="resolve-buton">
            {isPending ? "Resolving..." : "Resolve Incident"}
          </button>
          {isError && <p>Failed to resolve incident. Please try again.</p>}
        </div>
      )}
    </div>
  );
}