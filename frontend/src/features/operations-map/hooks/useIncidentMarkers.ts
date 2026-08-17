import { useEffect } from "react";
import { Marker, type Map as MapLibreMap } from "maplibre-gl";
import type { Incident } from "../../incidents/types";

interface UseIncidentMarkersParams {
  map: MapLibreMap | null;
  incidents: Incident[];
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

export function useIncidentMarkers({ map, incidents, onSelectIncident }: UseIncidentMarkersParams) {
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

      marker.getElement().addEventListener("click", () => onSelectIncident(incident));

      return marker;
    });

    return () => {
      markers.forEach((marker) => marker.remove());
    };
  }, [map, incidents, onSelectIncident]);
}