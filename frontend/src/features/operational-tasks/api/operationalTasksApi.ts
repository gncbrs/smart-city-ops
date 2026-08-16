import { httpClient } from "../../../shared/lib/httpClient";
import type { OperationalTask } from "../types";

export interface CreateOperationalTaskPayload {
  incidentId: string;
  fieldUnitId: string;
}

export async function fetchOperationalTasks(): Promise<OperationalTask[]> {
  const response = await httpClient.get<OperationalTask[]>("/operational-tasks");
  return response.data;
}

export async function createOperationalTask(payload: CreateOperationalTaskPayload): Promise<void> {
  await httpClient.post("/operational-tasks", payload);
}

export async function completeOperationalTask(taskId: string): Promise<void> {
  await httpClient.post(`/operational-tasks/${taskId}/complete`);
}
