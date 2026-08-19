import { useEffect, useRef, useState } from "react";
import { Map as MapLibreMap, type LngLatBoundsLike } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { Incident } from "../../incidents/types";
import type { FieldUnit } from "../../field-units/types";          // YENİ
import { useIncidentMarkers } from "../hooks/useIncidentMarkers";
import { useFieldUnitMarkers } from "../hooks/useFieldUnitMarkers"; // YENİ
import "../styles/OperationsMap.css";

const ANKARA_CENTER: [number, number] = [32.836, 39.925];

const ANKARA_BOUNDS: LngLatBoundsLike = [
  [32.4, 39.6],
  [33.3, 40.2],
];

interface OperationsMapProps {
  incidents: Incident[];
  fieldUnits: FieldUnit[];                                  // YENİ
  onSelectIncident: (incident: Incident) => void;
  onSelectFieldUnit: (fieldUnit: FieldUnit) => void;
}

export function OperationsMap({ incidents, fieldUnits, onSelectIncident, onSelectFieldUnit }: OperationsMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const [map, setMap] = useState<MapLibreMap | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const instance = new MapLibreMap({
      container: mapContainerRef.current,
      style: "https://tiles.openfreemap.org/styles/liberty",
      center: ANKARA_CENTER,
      zoom: 1,
      minZoom: 1,
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
  useFieldUnitMarkers({ map, fieldUnits, onSelectFieldUnit });

  return <div ref={mapContainerRef} className="operations-map" />;
}