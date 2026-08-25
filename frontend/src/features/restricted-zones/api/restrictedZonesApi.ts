import { httpClient } from "../../../shared/lib/httpClient";
import type { CreateRestrictedZoneDto, RestrictedZone, UpdateRestrictedZoneDto } from "../types";

export async function fetchRestrictedZones(): Promise<RestrictedZone[]> {
  const response = await httpClient.get<RestrictedZone[]>("/restricted-zones");
  return response.data;
}

export async function createRestrictedZone(dto: CreateRestrictedZoneDto): Promise<RestrictedZone> {
  const response = await httpClient.post<RestrictedZone>("/restricted-zones", dto);
  return response.data;
}

export async function updateRestrictedZone(id: string, dto: UpdateRestrictedZoneDto): Promise<RestrictedZone> {
  const response = await httpClient.put<RestrictedZone>(`/restricted-zones/${id}`, dto);
  return response.data;
}

export async function deleteRestrictedZone(id: string): Promise<void> {
  await httpClient.delete(`/restricted-zones/${id}`);
}
