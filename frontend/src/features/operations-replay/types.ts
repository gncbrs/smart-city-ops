import type { GeoLocation } from "../../shared/types/common";
import type { Incident } from "../incidents/types";
import type { OperationalTask } from "../operational-tasks/types";
import type { FieldUnitType, FieldUnitStatus } from "../field-units/types";

export type ReplayMode = "live" | "replay";

export type ReplaySpeed = 1 | 2 | 5;

export interface FieldUnitReplay extends GeoLocation {
  id: string;
  unitCode: string;
  type: FieldUnitType;
  status: FieldUnitStatus;
}

export interface OperationsSnapshot {
  timestamp: string;
  incidents: Incident[];
  fieldUnits: FieldUnitReplay[];
  activeTasks: OperationalTask[];
}

export interface ReplayTimeRange {
  minTimestamp: string | null;
  maxTimestamp: string | null;
}
