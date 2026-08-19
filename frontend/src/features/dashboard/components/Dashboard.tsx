import type { Incident } from "../../incidents/types";
import type { FieldUnit } from "../../field-units/types";

interface DashboardProps {
  incidents: Incident[];
  fieldUnits: FieldUnit[];
}

export function Dashboard({ incidents, fieldUnits }: DashboardProps) {
  const availableCount = fieldUnits.filter((unit) => unit.status === "Available").length;
  const dispatchedCount = fieldUnits.filter((unit) => unit.status === "Dispatched").length;
  const outOfServiceCount = fieldUnits.filter((unit) => unit.status === "OutOfService").length;

  const highPriorityActiveCount = incidents.filter(
    (incident) => incident.priority === "High" && incident.status !== "Resolved"
  ).length;

  return (
    <div>
      <p>High Priority Active Incidents: {highPriorityActiveCount}</p>
      <p>Available Field Units: {availableCount}</p>
      <p>Dispatched Field Units: {dispatchedCount}</p>
      <p>Out of Service Field Units: {outOfServiceCount}</p>
    </div>
  );
}