import { httpClient } from "../../../shared/lib/httpClient";
import type { FieldUnitRecommendation } from "../types";

export async function fetchFieldUnitRecommendations(incidentId: string): Promise<FieldUnitRecommendation[]> {
  const response = await httpClient.get<FieldUnitRecommendation[]>(`/incidents/${incidentId}/recommendations`);
  return response.data;
}
