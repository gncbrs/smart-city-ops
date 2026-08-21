import { useQuery } from "@tanstack/react-query";
import { fetchIncidents } from "../api/incidentsApi";

export function useIncidents() {
  return useQuery({
    queryKey: ["incidents"],
    queryFn: fetchIncidents,
  });
}