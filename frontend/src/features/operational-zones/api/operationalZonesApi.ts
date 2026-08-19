import { httpClient } from "../../../shared/lib/httpClient";
import type { OperationalZone } from "../types";

export async function fetchOperationalZones(): Promise<OperationalZone[]> {
  const response = await httpClient.get<OperationalZone[]>("/operational-zones");
  return response.data;
}