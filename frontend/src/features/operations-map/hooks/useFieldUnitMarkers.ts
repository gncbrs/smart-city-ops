import { useEffect, useRef } from "react";
import { Marker, type Map as MapLibreMap } from "maplibre-gl";
import type { GeoLocation } from "../../../shared/types/common";
import type { FieldUnit } from "../../field-units/types";
import type { OperationalTask } from "../../operational-tasks/types";
import { getCurrentPosition, getTravelProgress, isInFlightTask, type InFlightOperationalTask } from "../../operational-tasks/lib/geoInterpolation";

interface UseFieldUnitMarkersParams {
  map: MapLibreMap | null;
  fieldUnits: FieldUnit[];
  operationalTasks: OperationalTask[];
  selectedFieldUnitId: string | null;
  onSelectFieldUnit: (fieldUnit: FieldUnit) => void;
}

const SELECTED_MARKER_CLASS = "field-unit-marker--selected";

function isInFlightTaskForFieldUnit(fieldUnitId: string) {
  return (candidate: OperationalTask): candidate is InFlightOperationalTask =>
    candidate.fieldUnitId === fieldUnitId && isInFlightTask(candidate);
}

function findInFlightTask(fieldUnitId: string, operationalTasks: OperationalTask[]): InFlightOperationalTask | null {
  return operationalTasks.find(isInFlightTaskForFieldUnit(fieldUnitId)) ?? null;
}

export function useFieldUnitMarkers({
  map,
  fieldUnits,
  operationalTasks,
  selectedFieldUnitId,
  onSelectFieldUnit,
}: UseFieldUnitMarkersParams) {
  const markersRef = useRef(new Map<string, Marker>());
  const fieldUnitsByIdRef = useRef(new Map<string, FieldUnit>());
  const operationalTasksRef = useRef<OperationalTask[]>([]);
  const lastRestingPositionsRef = useRef(new Map<string, GeoLocation>());
  const onSelectFieldUnitRef = useRef(onSelectFieldUnit);
  onSelectFieldUnitRef.current = onSelectFieldUnit;
  fieldUnitsByIdRef.current = new Map(fieldUnits.map((fieldUnit) => [fieldUnit.id, fieldUnit]));
  operationalTasksRef.current = operationalTasks;

  // Mount/unmount only: tears every marker down once, when the map instance itself goes away.
  // Deliberately does NOT depend on fieldUnits/selectedFieldUnitId — those are handled by the
  // diffing effect below, which must never destroy-and-recreate markers (that would reset
  // in-flight animation on every SignalR-triggered refetch).
  useEffect(() => {
    if (!map) return;

    const markers = markersRef.current;

    return () => {
      for (const marker of markers.values()) {
        marker.remove();
      }
      markers.clear();
    };
  }, [map]);

  // Incremental diff: add markers for new field units, remove markers for ones no longer present,
  // update selection styling. Existing markers are left in place so their animated position isn't
  // interrupted by unrelated data refetches.
  useEffect(() => {
    if (!map) return;

    const markers = markersRef.current;
    const seenIds = new Set(fieldUnits.map((fieldUnit) => fieldUnit.id));

    for (const [fieldUnitId, marker] of markers) {
      if (!seenIds.has(fieldUnitId)) {
        marker.remove();
        markers.delete(fieldUnitId);
      }
    }

    for (const fieldUnit of fieldUnits) {
      let marker = markers.get(fieldUnit.id);

      if (!marker) {
        marker = new Marker({ color: "#2563eb" }).setLngLat([fieldUnit.longitude, fieldUnit.latitude]).addTo(map);
        marker.getElement().addEventListener("click", (event) => {
          event.stopPropagation();
          const latest = fieldUnitsByIdRef.current.get(fieldUnit.id) ?? fieldUnit;
          onSelectFieldUnitRef.current(latest);
        });
        markers.set(fieldUnit.id, marker);
      }

      marker.getElement().classList.toggle(SELECTED_MARKER_CLASS, fieldUnit.id === selectedFieldUnitId);
    }
  }, [map, fieldUnits, selectedFieldUnitId]);

  // Continuous animation loop: every frame, place each marker either at its resting position or,
  // for a field unit with an in-flight task, at its interpolated position along the ETA-timed line.
  //
  // Dispatched units are a special case: the backend sets fieldUnit.latitude/longitude to the
  // destination the instant a task is created, but field-units and operational-tasks are
  // invalidated as two separate React Query refetches off the same SignalR event, so there's a
  // window where a Dispatched unit's task hasn't arrived in `operationalTasks` yet. Snapping to
  // `destination` during that window is what caused the teleport; holding at the last resting
  // position instead bridges the gap until the task data catches up.
  //
  // Depends only on [map]: closing over `fieldUnits`/`operationalTasks` directly would tear this
  // effect down and restart `requestAnimationFrame` on every SignalR-triggered refetch, causing a
  // visible stutter. Instead the tick function reads `fieldUnitsByIdRef.current`/
  // `operationalTasksRef.current`, which are updated every render above without re-running this
  // effect; the loop itself only starts once (when `map` becomes ready) and stops on unmount.
  useEffect(() => {
    if (!map) return;

    let animationFrameId: number;
    const lastRestingPositions = lastRestingPositionsRef.current;
    const markers = markersRef.current;

    const tick = () => {
      const now = Date.now();

      for (const [fieldUnitId, marker] of markers) {
        const fieldUnit = fieldUnitsByIdRef.current.get(fieldUnitId);
        if (!fieldUnit) continue;

        const task = findInFlightTask(fieldUnitId, operationalTasksRef.current);
        const destination = { latitude: fieldUnit.latitude, longitude: fieldUnit.longitude };

        if (task) {
          const position = getCurrentPosition(task, destination, now);
          marker.setLngLat([position.longitude, position.latitude]);

          const progress = getTravelProgress(new Date(task.assignedAt).getTime(), task.estimatedEtaSeconds, now);
          if (progress >= 1) {
            lastRestingPositions.set(fieldUnitId, destination);
          }
          continue;
        }

        if (fieldUnit.status === "Dispatched") {
          const restingPosition = lastRestingPositions.get(fieldUnitId) ?? destination;
          marker.setLngLat([restingPosition.longitude, restingPosition.latitude]);
          continue;
        }

        marker.setLngLat([destination.longitude, destination.latitude]);
        lastRestingPositions.set(fieldUnitId, destination);
      }

      animationFrameId = requestAnimationFrame(tick);
    };

    animationFrameId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(animationFrameId);
  }, [map]);
}
