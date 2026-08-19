import { useEffect } from "react";
import { Marker, type Map as MapLibreMap } from "maplibre-gl";
import type { Incident } from "../../incidents/types";

interface UseIncidentMarkersParams {
  map: MapLibreMap | null;
  incidents: Incident[];
  selectedIncidentId: string | null;
  onSelectIncident: (incident: Incident) => void;
}

const priorityColors: Record<string, string> = {
  High: "#e20b0b",    
  Medium: "#f59e0b",  
  Low: "#2eee41",     
};

const DEFAULT_MARKER_COLOR = "#6b7280"; //bilinmeyen bir priority gelirse
const HIGH_PRIORITY_SCALE = 1.4;
const DEFAULT_SCALE = 1;
const SELECTED_MARKER_CLASS = "incident-marker--selected";

export function useIncidentMarkers({
  map,
  incidents,
  selectedIncidentId,
  onSelectIncident,
}: UseIncidentMarkersParams) {
  useEffect(() => {
    if (!map) return;

    const activeIncidents = incidents.filter((incident) => incident.status !== "Resolved");

    const markers = activeIncidents.map((incident) => {
      const color = priorityColors[incident.priority] || DEFAULT_MARKER_COLOR;

      const isActiveHighPriority = incident.priority === "High" && incident.status !== "Resolved";
      const scale = isActiveHighPriority ? HIGH_PRIORITY_SCALE : DEFAULT_SCALE;

      const marker = new Marker({ color, scale })
        .setLngLat([incident.longitude, incident.latitude])
        .addTo(map);

      if (incident.id === selectedIncidentId) {
        marker.getElement().classList.add(SELECTED_MARKER_CLASS);
      }

      marker.getElement().addEventListener("click", () => onSelectIncident(incident));

      return marker;
    });

    return () => {
      markers.forEach((marker) => marker.remove());
    };
  }, [map, incidents, selectedIncidentId, onSelectIncident]);
}