import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteRestrictedZone } from "../api/restrictedZonesApi";

export function useDeleteRestrictedZone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteRestrictedZone(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["restricted-zones"] });
    },
  });
}
