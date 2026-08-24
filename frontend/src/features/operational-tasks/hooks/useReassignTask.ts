import { useMutation, useQueryClient } from "@tanstack/react-query";
import { reassignTask } from "../api/operationalTasksApi";

interface ReassignTaskVariables {
  taskId: string;
  newFieldUnitId: string;
}

export function useReassignTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, newFieldUnitId }: ReassignTaskVariables) => reassignTask(taskId, newFieldUnitId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
      queryClient.invalidateQueries({ queryKey: ["field-units"] });
      queryClient.invalidateQueries({ queryKey: ["operational-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["field-unit-location-histories"] });
    },
  });
}
