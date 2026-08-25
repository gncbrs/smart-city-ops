import { useEffect, useRef } from "react";
import { Marker, type Map as MapLibreMap } from "maplibre-gl";
import type { FieldUnit } from "../../field-units/types";
import type { OperationalTask } from "../../operational-tasks/types";
import { getTravelProgress, interpolatePosition } from "../../operational-tasks/lib/geoInterpolation";

interface UseFieldUnitMarkersParams {
  map: MapLibreMap | null;
  fieldUnits: FieldUnit[];
  operationalTasks: OperationalTask[];
  selectedFieldUnitId: string | null;
  onSelectFieldUnit: (fieldUnit: FieldUnit) => void;
}

const SELECTED_MARKER_CLASS = "field-unit-marker--selected";

function findInFlightTask(fieldUnitId: string, operationalTasks: OperationalTask[]): OperationalTask | null {
  return (
    operationalTasks.find(
      (task) =>
        task.fieldUnitId === fieldUnitId &&
        task.status === "Assigned" &&
        task.originLatitude !== null &&
        task.originLongitude !== null &&
        task.estimatedEtaSeconds !== null,
    ) ?? null
  );
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
  const onSelectFieldUnitRef = useRef(onSelectFieldUnit);
  onSelectFieldUnitRef.current = onSelectFieldUnit;
  fieldUnitsByIdRef.current = new Map(fieldUnits.map((fieldUnit) => [fieldUnit.id, fieldUnit]));

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
  useEffect(() => {
    if (!map) return;

    let animationFrameId: number;

    const tick = () => {
      const now = Date.now();
      const markers = markersRef.current;

      for (const fieldUnit of fieldUnits) {
        const marker = markers.get(fieldUnit.id);
        if (!marker) continue;

        const task = findInFlightTask(fieldUnit.id, operationalTasks);
        const destination = { latitude: fieldUnit.latitude, longitude: fieldUnit.longitude };

        if (!task) {
          marker.setLngLat([destination.longitude, destination.latitude]);
          continue;
        }

        const origin = { latitude: task.originLatitude!, longitude: task.originLongitude! };
        const assignedAtMs = new Date(task.assignedAt).getTime();
        const progress = getTravelProgress(assignedAtMs, task.estimatedEtaSeconds!, now);

        const position =
          progress >= 1
            ? destination
            : interpolatePosition(origin, destination, assignedAtMs, task.estimatedEtaSeconds!, now);

        marker.setLngLat([position.longitude, position.latitude]);
      }

      animationFrameId = requestAnimationFrame(tick);
    };

    animationFrameId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(animationFrameId);
  }, [map, fieldUnits, operationalTasks]);
}
