import { useQuery } from "@tanstack/react-query";
import { fetchOperationalZones } from "../api/operationalZonesApi";

export function useOperationalZones() {
  return useQuery({
    queryKey: ["operational-zones"],
    queryFn: fetchOperationalZones,
    staleTime: Infinity,
  });
}