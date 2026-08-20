import { useQuery } from "@tanstack/react-query";
import { fetchFieldUnitLocationHistories } from "../api/fieldUnitLocationHistoriesApi";

export function useFieldUnitLocationHistories() {
  return useQuery({
    queryKey: ["field-unit-location-histories"],
    queryFn: fetchFieldUnitLocationHistories,
  });
}