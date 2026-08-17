import { useEffect } from "react";
import { Marker, type Map as MapLibreMap } from "maplibre-gl";
import type { Incident } from "../../incidents/types";

interface UseIncidentMarkersParams {
  map: MapLibreMap | null;
  incidents: Incident[];
  onSelectIncident: (incident: Incident) => void;
}

// 1. Önceliklere göre renk eşleştirmelerini dışarıda tanımlıyoruz
const priorityColors: Record<string, string> = {
  High: "#e20b0b",   // Kırmızı
  Medium: "#f59e0b", // Turuncu
  Low: "#2eee41",    // Mavi
};

export function useIncidentMarkers({ map, incidents, onSelectIncident }: UseIncidentMarkersParams) {
  useEffect(() => {
    if (!map) return;

    const markers = incidents.map((incident) => {
      // 2. Olayın önceliğine göre rengi sözlükten çekiyoruz. 
      // (Bilinmeyen bir değer gelirse diye varsayılan renk olarak gri atadık: #6b7280)
      const color = priorityColors[incident.priority] || "#060606";

      // 3. Rengi doğrudan Marker'ın içine parametre olarak veriyoruz
      const marker = new Marker({ color })
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