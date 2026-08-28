import { useEffect } from "react";
import type { Map as MapLibreMap } from "maplibre-gl";
import type { OperationalZone } from "../types";
import { buildZoneFeatureCollection } from "../lib/buildZoneGeoJson";
import { APP_COLORS } from "../../../shared/constants/colors";

interface UseOperationalZoneLayersParams {
  map: MapLibreMap | null;
  zones: OperationalZone[];
}

const ZONE_SOURCE_ID = "operational-zones";
const ZONE_FILL_LAYER_ID = "operational-zones-fill";
const ZONE_LABEL_LAYER_ID = "operational-zones-label";

export function useOperationalZoneLayers({ map, zones }: UseOperationalZoneLayersParams) {
  useEffect(() => {
    if (!map || zones.length === 0) return;

    const currentMap = map;
    const featureCollection = buildZoneFeatureCollection(zones);

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
          "fill-color": APP_COLORS.zones.operationalFill,
          "fill-opacity": ["interpolate", ["linear"], ["get", "weight"], 8, 0.08, 30, 0.3],
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
          "text-color": APP_COLORS.zones.operationalText,
          "text-halo-color": APP_COLORS.neutral.white,
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
      if (currentMap.getLayer(ZONE_FILL_LAYER_ID)) currentMap.removeLayer(ZONE_FILL_LAYER_ID);
      if (currentMap.getSource(ZONE_SOURCE_ID)) currentMap.removeSource(ZONE_SOURCE_ID);
    };
  }, [map, zones]);
}