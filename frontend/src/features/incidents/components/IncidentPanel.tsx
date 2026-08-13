import type { Incident } from "../types";

interface IncidentPanelProps {
  incident: Incident | null;
}

export function IncidentPanel({ incident }: IncidentPanelProps) {
  if (!incident) {
    return <div>Haritadan bir incident seçin.</div>;
  }

  return (
    <div>
      <h3>{incident.type}</h3>
      <p>Öncelik: {incident.priority}</p>
      <p>Durum: {incident.status}</p>
      <p>{incident.description}</p>
    </div>
  );
}
