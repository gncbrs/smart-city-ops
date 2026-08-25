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

export function getCurrentPosition(
  task: InFlightOperationalTask,
  destination: GeoLocation,
  nowMs: number,
): GeoLocation {
  const origin = { latitude: task.originLatitude, longitude: task.originLongitude };
  const assignedAtMs = new Date(task.assignedAt).getTime();
  const progress = getTravelProgress(assignedAtMs, task.estimatedEtaSeconds, nowMs);

  return progress >= 1
    ? destination
    : interpolatePosition(origin, destination, assignedAtMs, task.estimatedEtaSeconds, nowMs);
}
