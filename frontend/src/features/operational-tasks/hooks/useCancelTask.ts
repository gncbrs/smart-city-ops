import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cancelOperationalTask } from "../api/operationalTasksApi";

export function useCancelTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelOperationalTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
      queryClient.invalidateQueries({ queryKey: ["field-units"] });
      queryClient.invalidateQueries({ queryKey: ["operational-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["operational-statistics"] });
      queryClient.invalidateQueries({ queryKey: ["field-unit-location-histories"] });
    },
  });
}
