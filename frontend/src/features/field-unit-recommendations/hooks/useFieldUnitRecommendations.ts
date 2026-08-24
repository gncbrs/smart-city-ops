import { useQuery } from "@tanstack/react-query";
import { fetchFieldUnitRecommendations } from "../api/fieldUnitRecommendationsApi";

export function useFieldUnitRecommendations(incidentId: string | undefined) {
  return useQuery({
    queryKey: ["field-unit-recommendations", incidentId],
    queryFn: () => fetchFieldUnitRecommendations(incidentId as string),
    enabled: incidentId !== undefined,
    staleTime: 15_000,
  });
}
