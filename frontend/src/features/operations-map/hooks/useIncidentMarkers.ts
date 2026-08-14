import { useEffect } from "react";
import { Marker, type Map as MapLibreMap } from "maplibre-gl";
import type { Incident } from "../../incidents/types";

interface UseIncidentMarkersParams {
  map: MapLibreMap | null;
  incidents: Incident[];
  onSelectIncident: (incident: Incident) => void;
}

export function useIncidentMarkers({ map, incidents, onSelectIncident }: UseIncidentMarkersParams) {
  useEffect(() => {
    if (!map) return;

    const markers = incidents.map((incident) => {
      const marker = new Marker({ color: "#e20b0b" }).setLngLat([incident.longitude, incident.latitude]).addTo(map);

      marker.getElement().addEventListener("click", () => onSelectIncident(incident));

      return marker;
    });

    return () => {
      markers.forEach((marker) => marker.remove());
    };
  }, [map, incidents, onSelectIncident]);
}
