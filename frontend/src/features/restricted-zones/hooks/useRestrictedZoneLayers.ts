import { useEffect } from "react";
import type { Map as MapLibreMap } from "maplibre-gl";
import type { RestrictedZone } from "../types";
import { buildRestrictedZoneFeatureCollection } from "../lib/buildRestrictedZoneGeoJson";

interface UseRestrictedZoneLayersParams {
  map: MapLibreMap | null;
  zones: RestrictedZone[];
}

const ZONE_SOURCE_ID = "restricted-zones";
const ZONE_FILL_LAYER_ID = "restricted-zones-fill";
const ZONE_OUTLINE_LAYER_ID = "restricted-zones-outline";
const ZONE_LABEL_LAYER_ID = "restricted-zones-label";

export function useRestrictedZoneLayers({ map, zones }: UseRestrictedZoneLayersParams) {
  useEffect(() => {
    if (!map || zones.length === 0) return;

    const currentMap = map;
    const featureCollection = buildRestrictedZoneFeatureCollection(zones);

    function addZoneLayers() {
      if (currentMap.getSource(ZONE_SOURCE_ID)) return;

      currentMap.addSource(ZONE_SOURCE_ID, {
        type: "geojson",
        data: featureCollection,
      });

      currentMap.addLayer({
        id: ZONE_FILL_LAYER_ID,
        type: "fill",
        source: ZONE_SOURCE_ID,
        paint: {
          "fill-color": "#dc2626",
          "fill-opacity": 0.15,
        },
      });

      currentMap.addLayer({
        id: ZONE_OUTLINE_LAYER_ID,
        type: "line",
        source: ZONE_SOURCE_ID,
        paint: {
          "line-color": "#dc2626",
          "line-width": 2,
          "line-dasharray": [2, 2],
        },
      });

      currentMap.addLayer({
        id: ZONE_LABEL_LAYER_ID,
        type: "symbol",
        source: ZONE_SOURCE_ID,
        layout: {
          "text-field": ["get", "name"],
          "text-size": 12,
          "text-font": ["Noto Sans Regular"],
        },
        paint: {
          "text-color": "#7f1d1d",
          "text-halo-color": "#ffffff",
          "text-halo-width": 1,
        },
      });
    }

    if (currentMap.isStyleLoaded()) {
      addZoneLayers();
    } else {
      currentMap.once("load", addZoneLayers);
    }

    return () => {
      currentMap.off("load", addZoneLayers);
      if (currentMap.getLayer(ZONE_LABEL_LAYER_ID)) currentMap.removeLayer(ZONE_LABEL_LAYER_ID);
      if (currentMap.getLayer(ZONE_OUTLINE_LAYER_ID)) currentMap.removeLayer(ZONE_OUTLINE_LAYER_ID);
      if (currentMap.getLayer(ZONE_FILL_LAYER_ID)) currentMap.removeLayer(ZONE_FILL_LAYER_ID);
      if (currentMap.getSource(ZONE_SOURCE_ID)) currentMap.removeSource(ZONE_SOURCE_ID);
    };
  }, [map, zones]);
}
