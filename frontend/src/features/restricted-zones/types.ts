import type { GeoLocation } from "../../shared/types/common";

export type RestrictedZoneType = "Hazard" | "SecurityLockdown" | "RoadConstruction";

export interface RestrictedZone extends GeoLocation {
  id: string;
  name: string;
  description: string;
  radiusMeters: number;
  zoneType: RestrictedZoneType;
  createdAt: string;
  isActive: boolean;
}

export interface CreateRestrictedZoneDto {
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  zoneType: RestrictedZoneType;
}

export interface UpdateRestrictedZoneDto {
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  zoneType: RestrictedZoneType;
  isActive: boolean;
}
