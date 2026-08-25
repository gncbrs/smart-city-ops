import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateRestrictedZone } from "../api/restrictedZonesApi";
import type { UpdateRestrictedZoneDto } from "../types";

export function useUpdateRestrictedZone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateRestrictedZoneDto }) => updateRestrictedZone(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["restricted-zones"] });
    },
  });
}
