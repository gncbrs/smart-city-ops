import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateFieldUnitStatus } from "../api/fieldUnitsApi";

interface UpdateFieldUnitStatusVariables {
  id: string;
  status: string;
  reason?: string;
}

export function useUpdateFieldUnitStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status, reason }: UpdateFieldUnitStatusVariables) => updateFieldUnitStatus(id, status, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["field-units"] });
      queryClient.invalidateQueries({ queryKey: ["operational-statistics"] });
    },
  });
}
