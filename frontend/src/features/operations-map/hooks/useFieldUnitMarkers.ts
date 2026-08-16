import { useEffect } from "react";
import { Marker, type Map as MapLibreMap } from "maplibre-gl";
import type { FieldUnit } from "../../field-units/types";

interface UseFieldUnitMarkersParams {
  map: MapLibreMap | null;
  fieldUnits: FieldUnit[];
  onSelectFieldUnit: (fieldUnit: FieldUnit) => void;
}

export function useFieldUnitMarkers({ map, fieldUnits, onSelectFieldUnit }: UseFieldUnitMarkersParams) {
  useEffect(() => {
    if (!map) return;

    const markers = fieldUnits.map((fieldUnit) => {
      const marker = new Marker({ color: "#2563eb" })
        .setLngLat([fieldUnit.longitude, fieldUnit.latitude])
        .addTo(map);

      marker.getElement().addEventListener("click", () => onSelectFieldUnit(fieldUnit));

      return marker;
    });

    return () => {
      markers.forEach((marker) => marker.remove());
    };
  }, [map, fieldUnits, onSelectFieldUnit]);
}