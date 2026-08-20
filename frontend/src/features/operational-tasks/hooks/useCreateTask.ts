import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createOperationalTask } from "../api/operationalTasksApi";

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createOperationalTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
      queryClient.invalidateQueries({ queryKey: ["field-units"] });
      queryClient.invalidateQueries({ queryKey: ["operational-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["field-unit-location-histories"] });
    },
  });
}