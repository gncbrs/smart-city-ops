import { useQuery } from "@tanstack/react-query";
import { fetchFieldUnitMovementHistory } from "../api/fieldUnitsApi";

export function useFieldUnitMovementHistory(fieldUnitId: string | undefined) {
  return useQuery({
    queryKey: ["field-unit-movement-history", fieldUnitId],
    queryFn: () => fetchFieldUnitMovementHistory(fieldUnitId!),
    enabled: Boolean(fieldUnitId),
  });
}
