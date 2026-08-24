import { httpClient } from "../../../shared/lib/httpClient";
import type { CreateRestrictedZoneDto, RestrictedZone } from "../types";

export async function fetchRestrictedZones(): Promise<RestrictedZone[]> {
  const response = await httpClient.get<RestrictedZone[]>("/restricted-zones");
  return response.data;
}

export async function createRestrictedZone(dto: CreateRestrictedZoneDto): Promise<RestrictedZone> {
  const response = await httpClient.post<RestrictedZone>("/restricted-zones", dto);
  return response.data;
}
