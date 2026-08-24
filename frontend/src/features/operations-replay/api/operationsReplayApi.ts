import { httpClient } from "../../../shared/lib/httpClient";
import type { OperationsSnapshot, ReplayTimeRange } from "../types";

export async function fetchReplayTimeRange(): Promise<ReplayTimeRange> {
  const response = await httpClient.get<ReplayTimeRange>("/operations/replay/range");
  return response.data;
}

export async function fetchOperationsSnapshot(timestamp: string): Promise<OperationsSnapshot> {
  const response = await httpClient.get<OperationsSnapshot>("/operations/replay", {
    params: { timestamp },
  });
  return response.data;
}
