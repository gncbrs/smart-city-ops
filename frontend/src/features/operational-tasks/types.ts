export type OperationalTaskStatus = "Assigned" | "Completed" | "Reassigned" | "Cancelled";

export interface OperationalTask {
  id: string;
  incidentId: string;
  fieldUnitId: string;
  status: OperationalTaskStatus;
  assignedAt: string;
  completedAt: string | null;
  reassignedAt?: string | null;
  cancelledAt?: string | null;
  originLatitude: number | null;
  originLongitude: number | null;
  estimatedEtaSeconds: number | null;
  routeGeometry?: string | null;
}
