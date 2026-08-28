import { useEffect, useRef } from "react";
import type { GeoJSONSource, Map as MapLibreMap } from "maplibre-gl";
import type { RestrictedZone } from "../types";
import { buildRestrictedZoneFeatureCollection } from "../lib/buildRestrictedZoneGeoJson";
import { APP_COLORS } from "../../../shared/constants/colors";

interface UseRestrictedZoneLayersParams {
  map: MapLibreMap | null;
  zones: RestrictedZone[];
}

const ZONE_SOURCE_ID = "restricted-zones";
const ZONE_FILL_LAYER_ID = "restricted-zones-fill";
const ZONE_OUTLINE_LAYER_ID = "restricted-zones-outline";
const ZONE_LABEL_LAYER_ID = "restricted-zones-label";

export function useRestrictedZoneLayers({ map, zones }: UseRestrictedZoneLayersParams) {
  const zonesRef = useRef(zones);
  zonesRef.current = zones;

  // Create the source and layers once per map instance; torn down only when the map itself goes away.
  useEffect(() => {
    if (!map) return;

    const currentMap = map;

    function addZoneLayers() {
      if (currentMap.getSource(ZONE_SOURCE_ID)) return;

      currentMap.addSource(ZONE_SOURCE_ID, {
        type: "geojson",
        data: buildRestrictedZoneFeatureCollection(zonesRef.current),
      });

      currentMap.addLayer({
        id: ZONE_FILL_LAYER_ID,
        type: "fill",
        source: ZONE_SOURCE_ID,
        paint: {
          "fill-color": APP_COLORS.zones.restrictedFill,
          "fill-opacity": 0.15,
        },
      });

      currentMap.addLayer({
        id: ZONE_OUTLINE_LAYER_ID,
        type: "line",
        source: ZONE_SOURCE_ID,
        paint: {
          "line-color": APP_COLORS.zones.restrictedFill,
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
          "text-color": APP_COLORS.zones.restrictedText,
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
      if (currentMap.getLayer(ZONE_OUTLINE_LAYER_ID)) currentMap.removeLayer(ZONE_OUTLINE_LAYER_ID);
      if (currentMap.getLayer(ZONE_FILL_LAYER_ID)) currentMap.removeLayer(ZONE_FILL_LAYER_ID);
      if (currentMap.getSource(ZONE_SOURCE_ID)) currentMap.removeSource(ZONE_SOURCE_ID);
    };
  }, [map]);

  // Push fresh data into the existing source whenever the zones data changes.
  useEffect(() => {
    if (!map) return;

    const source = map.getSource(ZONE_SOURCE_ID) as GeoJSONSource | undefined;
    if (!source) return;

    source.setData(buildRestrictedZoneFeatureCollection(zones));
  }, [map, zones]);
}
