import type { Incident } from "../types";

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function getIncidentPriorityScore(incident: Incident): number {
  const hash = hashString(incident.id);

  switch (incident.priority) {
    case "Low":
      return 0 + (hash % 31);
    case "Medium":
      return 31 + (hash % 40);
    case "High":
      return 71 + (hash % 30);
  }
}

export function sortActiveIncidents(incidents: Incident[]): Incident[] {
  return incidents
    .filter((incident) => incident.status !== "Resolved")
    .sort((a, b) => {
      const scoreDiff = getIncidentPriorityScore(b) - getIncidentPriorityScore(a);
      if (scoreDiff !== 0) {
        return scoreDiff;
      }
      return a.type.localeCompare(b.type);
    });
}
