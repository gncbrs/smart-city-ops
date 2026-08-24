import type { Incident } from "../../incidents/types";
import type { FieldUnit } from "../../field-units/types";
import type { OperationalTask } from "../../operational-tasks/types";
import { useMapInstance } from "../hooks/useMapInstance";
import { useIncidentMarkers } from "../hooks/useIncidentMarkers";
import { useFieldUnitMarkers } from "../hooks/useFieldUnitMarkers";
import { useDispatchedRouteLayers } from "../hooks/useDispatchedRouteLayers";
import type { OperationalZone } from "../../operational-zones/types";
import { useOperationalZoneLayers } from "../../operational-zones/hooks/useOperationalZoneLayers";
import type { RestrictedZone } from "../../restricted-zones/types";
import { useRestrictedZoneLayers } from "../../restricted-zones/hooks/useRestrictedZoneLayers";
import "maplibre-gl/dist/maplibre-gl.css";
import "../styles/OperationsMap.css";

interface OperationsMapProps {
  incidents: Incident[];
  fieldUnits: FieldUnit[];
  zones: OperationalZone[];
  restrictedZones: RestrictedZone[];
  operationalTasks: OperationalTask[];
  selectedIncidentId: string | null;
  selectedFieldUnitId: string | null;
  onSelectIncident: (incident: Incident) => void;
  onSelectFieldUnit: (fieldUnit: FieldUnit) => void;
}

export function OperationsMap({
  incidents,
  fieldUnits,
  zones,
  restrictedZones,
  operationalTasks,
  selectedIncidentId,
  selectedFieldUnitId,
  onSelectIncident,
  onSelectFieldUnit,
}: OperationsMapProps) {
  const { mapContainerRef, map } = useMapInstance();

  useIncidentMarkers({ map, incidents, selectedIncidentId, onSelectIncident });
  useDispatchedRouteLayers({ map, operationalTasks, incidents });
  useFieldUnitMarkers({ map, fieldUnits, operationalTasks, selectedFieldUnitId, onSelectFieldUnit });
  useOperationalZoneLayers({ map, zones });
  useRestrictedZoneLayers({ map, zones: restrictedZones });

  return <div ref={mapContainerRef} className="operations-map" />;
}