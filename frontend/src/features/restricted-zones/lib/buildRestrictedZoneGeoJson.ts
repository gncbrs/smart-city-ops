import type { Feature, FeatureCollection, Polygon } from "geojson";
import type { RestrictedZone } from "../types";

const CIRCLE_POINTS = 48;
const METERS_PER_DEGREE_LATITUDE = 111_320;

export interface RestrictedZoneFeatureProperties {
  name: string;
  zoneType: string;
}

function buildRestrictedZoneCircle(zone: RestrictedZone): Feature<Polygon, RestrictedZoneFeatureProperties> {
  const latitudeDelta = zone.radiusMeters / METERS_PER_DEGREE_LATITUDE;
  const longitudeDelta =
    zone.radiusMeters / (METERS_PER_DEGREE_LATITUDE * Math.cos((zone.latitude * Math.PI) / 180));

  const coordinates: [number, number][] = [];

  for (let i = 0; i <= CIRCLE_POINTS; i++) {
    const angle = (i / CIRCLE_POINTS) * 2 * Math.PI;
    const longitude = zone.longitude + longitudeDelta * Math.cos(angle);
    const latitude = zone.latitude + latitudeDelta * Math.sin(angle);
    coordinates.push([longitude, latitude]);
  }

  return {
    type: "Feature",
    properties: { name: zone.name, zoneType: zone.zoneType },
    geometry: {
      type: "Polygon",
      coordinates: [coordinates],
    },
  };
}

export function buildRestrictedZoneFeatureCollection(
  zones: RestrictedZone[]
): FeatureCollection<Polygon, RestrictedZoneFeatureProperties> {
  return {
    type: "FeatureCollection",
    features: zones.filter((zone) => zone.isActive).map(buildRestrictedZoneCircle),
  };
}
