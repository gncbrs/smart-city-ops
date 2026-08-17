import type { GeoLocation } from "../../shared/types/common";

export type IncidentType =
  | "TrafficAccident"
  | "RoadClosure"
  | "FireAlert"
  | "InfrastructureFailure"
  | "FloodAlert"
  | "PublicSafetyAlert"
  | "UtilityFailure";

export type IncidentPriority = "Low" | "Medium" | "High";

export type IncidentStatus = "Open" | "InProgress" | "Resolved";

export interface Incident extends GeoLocation {
  id: string;
  type: IncidentType;
  priority: IncidentPriority;
  status: IncidentStatus;
  reportedAt: string;
  resolvedAt: string | null;
  description: string;
}
