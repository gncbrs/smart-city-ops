import { useEffect, useState } from "react";
import type { GeoJSONSource, Map as MapLibreMap } from "maplibre-gl";
import type { FeatureCollection, LineString } from "geojson";
import type { OperationalTask } from "../../operational-tasks/types";
import type { Incident } from "../../incidents/types";
import { getTravelProgress, isInFlightTask } from "../../operational-tasks/lib/geoInterpolation";

interface UseDispatchedRouteLayersParams {
  map: MapLibreMap | null;
  operationalTasks: OperationalTask[];
  incidents: Incident[];
}

const ROUTE_SOURCE_ID = "dispatched-routes";
const ROUTE_LINE_LAYER_ID = "dispatched-routes-line";
const TICK_INTERVAL_MS = 1000;

const EMPTY_FEATURE_COLLECTION: FeatureCollection<LineString> = { type: "FeatureCollection", features: [] };

function buildFeatureCollection(
  operationalTasks: OperationalTask[],
  incidents: Incident[],
  now: number,
): FeatureCollection<LineString> {
  const incidentById = new Map(incidents.map((incident) => [incident.id, incident]));

  const features = operationalTasks.flatMap((task) => {
    if (!isInFlightTask(task)) return [];

    const incident = incidentById.get(task.incidentId);
    if (!incident) return [];

    const progress = getTravelProgress(new Date(task.assignedAt).getTime(), task.estimatedEtaSeconds, now);
    if (progress >= 1) return [];

    return [
      {
        type: "Feature" as const,
        properties: { taskId: task.id },
        geometry: {
          type: "LineString" as const,
          coordinates: [
            [task.originLongitude, task.originLatitude],
            [incident.longitude, incident.latitude],
          ],
        },
      },
    ];
  });

  return { type: "FeatureCollection", features };
}

export function useDispatchedRouteLayers({ map, operationalTasks, incidents }: UseDispatchedRouteLayersParams) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTick((value) => value + 1), TICK_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!map) return;

    const currentMap = map;

    function addRouteLayer() {
      if (currentMap.getSource(ROUTE_SOURCE_ID)) return;

      currentMap.addSource(ROUTE_SOURCE_ID, {
        type: "geojson",
        data: EMPTY_FEATURE_COLLECTION,
      });

      currentMap.addLayer({
        id: ROUTE_LINE_LAYER_ID,
        type: "line",
        source: ROUTE_SOURCE_ID,
        paint: {
          "line-color": "#2563eb",
          "line-width": 2,
          "line-dasharray": [2, 2],
          "line-opacity": 0.6,
        },
      });
    }

    if (currentMap.isStyleLoaded()) {
      addRouteLayer();
    } else {
      currentMap.once("load", addRouteLayer);
    }

    return () => {
      currentMap.off("load", addRouteLayer);
      if (currentMap.getLayer(ROUTE_LINE_LAYER_ID)) currentMap.removeLayer(ROUTE_LINE_LAYER_ID);
      if (currentMap.getSource(ROUTE_SOURCE_ID)) currentMap.removeSource(ROUTE_SOURCE_ID);
    };
  }, [map]);

  useEffect(() => {
    if (!map) return;

    const source = map.getSource(ROUTE_SOURCE_ID) as GeoJSONSource | undefined;
    if (!source) return;

    source.setData(buildFeatureCollection(operationalTasks, incidents, Date.now()));
  }, [map, operationalTasks, incidents, tick]);
}
