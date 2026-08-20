import { httpClient } from "../../../shared/lib/httpClient";
import type { FieldUnitLocationHistory } from "../types";

export async function fetchFieldUnitLocationHistories(): Promise<FieldUnitLocationHistory[]> {
  const response = await httpClient.get<FieldUnitLocationHistory[]>("/field-unit-location-histories");
  return response.data;
}