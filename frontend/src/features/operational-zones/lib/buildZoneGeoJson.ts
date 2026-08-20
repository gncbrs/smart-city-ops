import type { Feature, FeatureCollection, Polygon } from "geojson";
import type { OperationalZone } from "../types";

const CIRCLE_POINTS = 48;

export interface ZoneFeatureProperties {
  name: string;
  weight: number;
}

function buildZoneCircle(zone: OperationalZone): Feature<Polygon, ZoneFeatureProperties> {
  const coordinates: [number, number][] = [];

  for (let i = 0; i <= CIRCLE_POINTS; i++) {
    const angle = (i / CIRCLE_POINTS) * 2 * Math.PI;
    const longitude = zone.longitude + zone.spread * Math.cos(angle);
    const latitude = zone.latitude + zone.spread * Math.sin(angle);
    coordinates.push([longitude, latitude]);
  }

  return {
    type: "Feature",
    properties: { name: zone.name, weight: zone.weight },
    geometry: {
      type: "Polygon",
      coordinates: [coordinates],
    },
  };
}

export function buildZoneFeatureCollection(
  zones: OperationalZone[]
): FeatureCollection<Polygon, ZoneFeatureProperties> {
  return {
    type: "FeatureCollection",
    features: zones.map(buildZoneCircle),
  };
}