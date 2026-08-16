export type OperationalTaskStatus = "Assigned" | "Completed";

export interface OperationalTask {
  id: string;
  incidentId: string;
  fieldUnitId: string;
  status: OperationalTaskStatus;
  assignedAt: string;
  completedAt: string | null;
}
