import { useEffect, useRef, useState } from "react";
import { Map as MapLibreMap, type LngLatBoundsLike } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { Incident } from "../../incidents/types";
import { useIncidentMarkers } from "../hooks/useIncidentMarkers";
import "../styles/OperationsMap.css";

const ANKARA_CENTER: [number, number] = [32.836, 39.925];

// Ankara metropolitan alanını kapsayan sınır kutusu — operatör haritayı bunun dışına kaydıramaz.
const ANKARA_BOUNDS: LngLatBoundsLike = [
  [32.4, 39.6],
  [33.3, 40.2],
];

interface OperationsMapProps {
  incidents: Incident[];
  onSelectIncident: (incident: Incident) => void;
}

export function OperationsMap({ incidents, onSelectIncident }: OperationsMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const [map, setMap] = useState<MapLibreMap | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const instance = new MapLibreMap({
      container: mapContainerRef.current,
      style: "https://tiles.openfreemap.org/styles/liberty",
      center: ANKARA_CENTER,
      zoom: 12,
      minZoom: 10,
      maxBounds: ANKARA_BOUNDS,
    });

    mapRef.current = instance;
    setMap(instance);

    const resizeObserver = new ResizeObserver(() => {
      instance.resize();
    });
    resizeObserver.observe(mapContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      instance.remove();
      mapRef.current = null;
      setMap(null);
    };
  }, []);

  useIncidentMarkers({ map, incidents, onSelectIncident });

  return <div ref={mapContainerRef} className="operations-map" />;
}
