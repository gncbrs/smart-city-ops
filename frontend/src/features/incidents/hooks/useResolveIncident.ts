import { useMutation, useQueryClient } from "@tanstack/react-query";
import { resolveIncident } from "../api/incidentsApi";

export function useResolveIncident() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: resolveIncident,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
      queryClient.invalidateQueries({ queryKey: ["field-units"] });
      queryClient.invalidateQueries({ queryKey: ["operational-tasks"] });
    },
  });
}
