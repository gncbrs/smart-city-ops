import { useQuery } from "@tanstack/react-query";
import { fetchRestrictedZones } from "../api/restrictedZonesApi";

export function useRestrictedZones() {
  return useQuery({
    queryKey: ["restricted-zones"],
    queryFn: fetchRestrictedZones,
  });
}
