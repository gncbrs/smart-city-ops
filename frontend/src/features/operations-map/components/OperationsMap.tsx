import type { Incident } from "../../incidents/types";
import type { FieldUnit } from "../../field-units/types";
import { useMapInstance } from "../hooks/useMapInstance";
import { useIncidentMarkers } from "../hooks/useIncidentMarkers";
import { useFieldUnitMarkers } from "../hooks/useFieldUnitMarkers";
import type { OperationalZone } from "../../operational-zones/types";
import { useOperationalZoneLayers } from "../../operational-zones/hooks/useOperationalZoneLayers";
import "maplibre-gl/dist/maplibre-gl.css";
import "../styles/OperationsMap.css";

interface OperationsMapProps {
  incidents: Incident[];
  fieldUnits: FieldUnit[];
  zones: OperationalZone[];
  selectedIncidentId: string | null;
  selectedFieldUnitId: string | null;
  onSelectIncident: (incident: Incident) => void;
  onSelectFieldUnit: (fieldUnit: FieldUnit) => void;
}

export function OperationsMap({
  incidents,
  fieldUnits,
  zones,
  selectedIncidentId,
  selectedFieldUnitId,
  onSelectIncident,
  onSelectFieldUnit,
}: OperationsMapProps) {
  const { mapContainerRef, map } = useMapInstance();

  useIncidentMarkers({ map, incidents, selectedIncidentId, onSelectIncident });
  useFieldUnitMarkers({ map, fieldUnits, selectedFieldUnitId, onSelectFieldUnit });
  useOperationalZoneLayers({ map, zones });

  return <div ref={mapContainerRef} className="operations-map" />;
}