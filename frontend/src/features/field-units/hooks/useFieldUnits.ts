import { useQuery } from "@tanstack/react-query";
import { fetchFieldUnits } from "../api/fieldUnitsApi";

export function useFieldUnits() {
  return useQuery({
    queryKey: ["field-units"],
    queryFn: fetchFieldUnits,
  });
}