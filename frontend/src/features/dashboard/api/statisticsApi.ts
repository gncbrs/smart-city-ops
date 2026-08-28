import { httpClient } from "../../../shared/lib/httpClient";
import type { OperationalStatistics } from "../types";

export async function fetchOperationalStatistics(): Promise<OperationalStatistics> {
  const response = await httpClient.get<OperationalStatistics>("/operations/statistics");
  return response.data;
}
