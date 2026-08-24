import { useQuery } from "@tanstack/react-query";
import { fetchOperationsSnapshot } from "../api/operationsReplayApi";

export function useOperationsSnapshot(timestamp: string | null, enabled: boolean) {
  return useQuery({
    queryKey: ["operations-snapshot", timestamp],
    queryFn: () => fetchOperationsSnapshot(timestamp as string),
    enabled: enabled && timestamp !== null,
  });
}
