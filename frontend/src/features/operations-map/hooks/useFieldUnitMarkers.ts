import { useEffect } from "react";
import { Marker, type Map as MapLibreMap } from "maplibre-gl";
import type { FieldUnit } from "../../field-units/types";

interface UseFieldUnitMarkersParams {
  map: MapLibreMap | null;
  fieldUnits: FieldUnit[];
  selectedFieldUnitId: string | null;
  onSelectFieldUnit: (fieldUnit: FieldUnit) => void;
}

const SELECTED_MARKER_CLASS = "field-unit-marker--selected";

export function useFieldUnitMarkers({
  map,
  fieldUnits,
  selectedFieldUnitId,
  onSelectFieldUnit,
}: UseFieldUnitMarkersParams) {
  useEffect(() => {
    if (!map) return;

    const markers = fieldUnits.map((fieldUnit) => {
      const marker = new Marker({ color: "#2563eb" })
        .setLngLat([fieldUnit.longitude, fieldUnit.latitude])
        .addTo(map);

      if (fieldUnit.id === selectedFieldUnitId) {
        marker.getElement().classList.add(SELECTED_MARKER_CLASS);
      }

      marker.getElement().addEventListener("click", () => onSelectFieldUnit(fieldUnit));

      return marker;
    });

    return () => {
      markers.forEach((marker) => marker.remove());
    };
  }, [map, fieldUnits, selectedFieldUnitId, onSelectFieldUnit]);
}