import { useQuery } from "@tanstack/react-query";
import { fetchIncidentTimeline } from "../api/incidentsApi";

export function useIncidentTimeline(incidentId: string | undefined) {
  return useQuery({
    queryKey: ["incident-timeline", incidentId],
    queryFn: () => fetchIncidentTimeline(incidentId!),
    enabled: Boolean(incidentId),
  });
}
