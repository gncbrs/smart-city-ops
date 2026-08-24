import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createRestrictedZone } from "../api/restrictedZonesApi";

export function useCreateRestrictedZone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createRestrictedZone,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["restricted-zones"] });
    },
  });
}
