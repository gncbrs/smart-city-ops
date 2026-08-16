import { useMutation, useQueryClient } from "@tanstack/react-query";
import { completeOperationalTask } from "../api/operationalTasksApi";

export function useCompleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: completeOperationalTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
      queryClient.invalidateQueries({ queryKey: ["field-units"] });
      queryClient.invalidateQueries({ queryKey: ["operational-tasks"] });
    },
  });
}
