import { useEffect, useRef } from "react";
import type { GeoJSONSource, Map as MapLibreMap } from "maplibre-gl";
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
  const zonesRef = useRef(zones);
  zonesRef.current = zones;

  // Mount/unmount only: creates the source + layers once (or once the style finishes loading),
  // and tears them down only when the map instance itself goes away. Deliberately does NOT depend
  // on `zones` — data updates are handled in-place by the effect below via `.setData(...)`, which
  // avoids the removeLayer/removeSource/addSource/addLayer churn of recreating everything on every
  // zones refetch (e.g. the periodic SignalR-triggered invalidation).
  useEffect(() => {
    if (!map) return;

    const currentMap = map;

    function addZoneLayers() {
      if (currentMap.getSource(ZONE_SOURCE_ID)) return;

      currentMap.addSource(ZONE_SOURCE_ID, {
        type: "geojson",
        data: buildZoneFeatureCollection(zonesRef.current),
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
  }, [map]);

  // Data sync: whenever `zones` changes, push the new FeatureCollection into the existing source
  // via `.setData(...)` instead of tearing down and recreating the source/layers. If the source
  // isn't there yet (style still loading), this is a no-op — the mount effect above seeds the
  // source with `zonesRef.current` (the latest zones at creation time) once the style finishes
  // loading, so there's no blank-map window.
  useEffect(() => {
    if (!map) return;

    const featureCollection = buildZoneFeatureCollection(zones);
    const source = map.getSource(ZONE_SOURCE_ID) as GeoJSONSource | undefined;
    if (source) {
      source.setData(featureCollection);
    }
  }, [map, zones]);
}