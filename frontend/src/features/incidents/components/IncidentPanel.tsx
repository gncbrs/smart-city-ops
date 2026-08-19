import type { Incident } from "../types";
import { useResolveIncident } from "../hooks/useResolveIncident";
import { formatEnumLabel } from "../../../shared/lib/formatLabel";
import "../styles/IncidentPanel.css";

interface IncidentPanelProps {
  incident: Incident | null;
  onResolved: () => void;
  onViewTimeline: () => void;
}

export function IncidentPanel({ incident, onResolved, onViewTimeline }: IncidentPanelProps) {
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

      <div className="incident-panel__actions">
        <button type="button" onClick={onViewTimeline} className="view-timeline-button">
          View Timeline
        </button>
        {incident.status !== "Resolved" && (
          <button onClick={handleResolve} disabled={isPending} className="resolve-button">
            {isPending ? "Resolving..." : "Resolve Incident"}
          </button>
        )}
      </div>

      {isError && <p>Failed to resolve incident. Please try again.</p>}
    </div>
  );
}