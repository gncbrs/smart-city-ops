import type { Incident } from "../types";

interface IncidentPanelProps {
  incident: Incident | null;
}

export function IncidentPanel({ incident }: IncidentPanelProps) {
  if (!incident) {
    return <div>Select an incident point to show details of it.</div>;
  }

  return (
    <div>
      <h3>{incident.type}</h3>
      <p>Priority: {incident.priority}</p>
      <p>Status: {incident.status}</p>
      <p>Description: {incident.description}</p>
    </div>
  );
}
