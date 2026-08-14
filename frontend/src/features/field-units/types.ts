import type { GeoLocation } from "../../shared/types/common";

export type FieldUnitType = "Police" | "Medical" | "Fire" | "UtilityCrew" | "TrafficControl";

export type FieldUnitStatus = "Available" | "Dispatched" | "OutOfService";

export interface FieldUnit extends GeoLocation {
  id: string;
  unitCode: string;
  type: FieldUnitType;
  status: FieldUnitStatus;
}