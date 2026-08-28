import { useQuery } from "@tanstack/react-query";
import { fetchOperationalStatistics } from "../api/statisticsApi";

export function useOperationalStatistics() {
  return useQuery({
    queryKey: ["operational-statistics"],
    queryFn: fetchOperationalStatistics,
  });
}
