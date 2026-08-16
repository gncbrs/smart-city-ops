import { useQuery } from "@tanstack/react-query";
import { fetchOperationalTasks } from "../api/operationalTasksApi";

export function useOperationalTasks() {
  return useQuery({
    queryKey: ["operational-tasks"],
    queryFn: fetchOperationalTasks,
  });
}
