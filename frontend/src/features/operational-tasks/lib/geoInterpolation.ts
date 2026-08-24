import type { GeoLocation } from "../../../shared/types/common";

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
