import { useQuery } from "@tanstack/react-query";
import { fetchReplayTimeRange } from "../api/operationsReplayApi";

export function useReplayTimeRange() {
  return useQuery({
    queryKey: ["replay-time-range"],
    queryFn: fetchReplayTimeRange,
  });
}
