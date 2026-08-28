import type { GeoLocation } from "../../../shared/types/common";
import type { OperationalTask } from "../types";

export type InFlightOperationalTask = OperationalTask & {
  originLatitude: number;
  originLongitude: number;
  estimatedEtaSeconds: number;
};

export function isInFlightTask(task: OperationalTask): task is InFlightOperationalTask {
  return (
    task.status === "Assigned" &&
    task.originLatitude !== null &&
    task.originLongitude !== null &&
    task.estimatedEtaSeconds !== null
  );
}

export function getTravelProgress(assignedAtMs: number, etaSeconds: number, nowMs: number): number {
  if (etaSeconds <= 0) return 1;

  const elapsedMs = nowMs - assignedAtMs;
  return Math.min(1, Math.max(0, elapsedMs / (etaSeconds * 1000)));
}

export function interpolatePosition(
  origin: GeoLocation,
  destination: GeoLocation,
  assignedAtMs: number,
  etaSeconds: number,
  nowMs: number,
): GeoLocation {
  const t = getTravelProgress(assignedAtMs, etaSeconds, nowMs);

  return {
    latitude: origin.latitude + t * (destination.latitude - origin.latitude),
    longitude: origin.longitude + t * (destination.longitude - origin.longitude),
  };
}

function haversineDistance(a: GeoLocation, b: GeoLocation): number {
  const earthRadiusKm = 6371.0;
  const toRad = (degrees: number) => (degrees * Math.PI) / 180;

  const dLat = toRad(b.latitude - a.latitude);
  const dLng = toRad(b.longitude - a.longitude);

  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const h =
    sinLat * sinLat + Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * sinLng * sinLng;

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function parseRouteGeometry(routeGeometry: string | null | undefined): GeoLocation[] | null {
  if (!routeGeometry) return null;

  try {
    const parsed: unknown = JSON.parse(routeGeometry);
    if (!Array.isArray(parsed) || parsed.length < 2) return null;

    const points: GeoLocation[] = [];
    for (const entry of parsed) {
      if (
        !Array.isArray(entry) ||
        entry.length < 2 ||
        typeof entry[0] !== "number" ||
        typeof entry[1] !== "number"
      ) {
        return null;
      }
      points.push({ longitude: entry[0], latitude: entry[1] });
    }

    return points;
  } catch {
    return null;
  }
}

function interpolateAlongPolyline(points: GeoLocation[], progress: number): GeoLocation {
  const segmentDistances: number[] = [];
  let totalDistance = 0;

  for (let i = 0; i < points.length - 1; i++) {
    const segmentDistance = haversineDistance(points[i], points[i + 1]);
    segmentDistances.push(segmentDistance);
    totalDistance += segmentDistance;
  }

  if (totalDistance === 0) return points[points.length - 1];

  const targetDistance = progress * totalDistance;
  let coveredDistance = 0;

  for (let i = 0; i < segmentDistances.length; i++) {
    const segmentDistance = segmentDistances[i];
    if (coveredDistance + segmentDistance >= targetDistance) {
      const segmentProgress = segmentDistance === 0 ? 0 : (targetDistance - coveredDistance) / segmentDistance;
      const pointA = points[i];
      const pointB = points[i + 1];

      return {
        latitude: pointA.latitude + segmentProgress * (pointB.latitude - pointA.latitude),
        longitude: pointA.longitude + segmentProgress * (pointB.longitude - pointA.longitude),
      };
    }
    coveredDistance += segmentDistance;
  }

  return points[points.length - 1];
}

export function getCurrentPosition(
  task: InFlightOperationalTask,
  destination: GeoLocation,
  nowMs: number,
): GeoLocation {
  const origin = { latitude: task.originLatitude, longitude: task.originLongitude };
  const assignedAtMs = new Date(task.assignedAt).getTime();
  const progress = getTravelProgress(assignedAtMs, task.estimatedEtaSeconds, nowMs);

  if (progress >= 1) return destination;

  const routePoints = parseRouteGeometry(task.routeGeometry);
  if (routePoints) {
    return interpolateAlongPolyline(routePoints, progress);
  }

  return interpolatePosition(origin, destination, assignedAtMs, task.estimatedEtaSeconds, nowMs);
}
