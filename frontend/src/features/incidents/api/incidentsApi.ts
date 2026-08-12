import { httpClient } from "../../../shared/lib/httpClient";
import type { Incident } from "../types";

export async function fetchIncidents(): Promise<Incident[]> {
  const response = await httpClient.get<Incident[]>("/incidents");
  return response.data;
}

export async function fetchIncidentById(id: string): Promise<Incident> {
  const response = await httpClient.get<Incident>(`/incidents/${id}`);
  return response.data;
}
