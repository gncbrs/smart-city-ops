import { useEffect } from "react";
import { Marker, type Map as MapLibreMap } from "maplibre-gl";
import type { FieldUnit } from "../../field-units/types";

interface UseFieldUnitMarkersParams {
  map: MapLibreMap | null;
  fieldUnits: FieldUnit[];
}

export function useFieldUnitMarkers({ map, fieldUnits }: UseFieldUnitMarkersParams) {
  useEffect(() => {
    if (!map) return;

    const markers = fieldUnits.map((fieldUnit) =>
      new Marker({ color: "#2563eb" })
        .setLngLat([fieldUnit.longitude, fieldUnit.latitude])
        .addTo(map)
    );

    return () => {
      markers.forEach((marker) => marker.remove());
    };
  }, [map, fieldUnits]);
}