import { httpClient } from "../../../shared/lib/httpClient";
import type { Incident } from "../types";

export async function fetchIncidents(): Promise<Incident[]> {
  const response = await httpClient.get<Incident[]>("/incidents");
  return response.data;
}

// Backend'de GET /api/incidents/{id} henüz yok (bilinçli YAGNI, bkz. DEVELOPMENT_LOG.md Part 2 §2.7).
// Endpoint eklenince buradaki yorum kaldırılıp doğrudan kullanılabilir, fonksiyon zaten hazır.
// export async function fetchIncidentById(id: string): Promise<Incident> {
//   const response = await httpClient.get<Incident>(`/incidents/${id}`);
//   return response.data;
// }

export async function resolveIncident(id: string): Promise<Incident> {
  const response = await httpClient.post<Incident>(`/incidents/${id}/resolve`);
  return response.data;
}
