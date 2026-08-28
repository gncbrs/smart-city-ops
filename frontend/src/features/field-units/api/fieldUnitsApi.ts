import { httpClient } from "../../../shared/lib/httpClient";
import type { FieldUnit, FieldUnitMovementRecord } from "../types";

export async function fetchFieldUnits(): Promise<FieldUnit[]>
{
  const response = await httpClient.get<FieldUnit[]>("/field-units");
  return response.data;
}

export async function fetchFieldUnitMovementHistory(fieldUnitId: string): Promise<FieldUnitMovementRecord[]> {
  const response = await httpClient.get<FieldUnitMovementRecord[]>(`/field-units/${fieldUnitId}/movement-history`);
  return response.data;
}

export async function updateFieldUnitStatus(id: string, status: string, reason?: string): Promise<FieldUnit> {
  const response = await httpClient.patch<FieldUnit>(`/field-units/${id}/status`, { status, reason });
  return response.data;
}
