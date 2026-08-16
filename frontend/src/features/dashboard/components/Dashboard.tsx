import type { Incident } from "../../incidents/types";
import type { FieldUnit } from "../../field-units/types";
import type { OperationalTask } from "../../operational-tasks/types";
import { formatEnumLabel } from "../../../shared/lib/formatLabel";

interface DashboardProps {
  incidents: Incident[];
  fieldUnits: FieldUnit[];
  operationalTasks: OperationalTask[];
}

export function Dashboard({ incidents, fieldUnits, operationalTasks }: DashboardProps) {
  const availableCount = fieldUnits.filter((unit) => unit.status === "Available").length;
  const dispatchedCount = fieldUnits.filter((unit) => unit.status === "Dispatched").length;
  const outOfServiceCount = fieldUnits.filter((unit) => unit.status === "OutOfService").length;

  const activeTasks = operationalTasks.filter((task) => task.status === "Assigned");
  const completedTasks = operationalTasks.filter((task) => task.status === "Completed");

  const describeTask = (task: OperationalTask) => {
    const incident = incidents.find((item) => item.id === task.incidentId);
    const fieldUnit = fieldUnits.find((item) => item.id === task.fieldUnitId);
    const incidentLabel = incident ? formatEnumLabel(incident.type) : "Unknown incident";
    return `${fieldUnit?.unitCode ?? "Unknown unit"} → ${incidentLabel}`;
  };

  return (
    <div>
      <h2>Operational State</h2>

      <h3>Field Units</h3>
      <p>Available: {availableCount}</p>
      <p>Dispatched: {dispatchedCount}</p>
      <p>Out of Service: {outOfServiceCount}</p>

      <h3>Active Tasks ({activeTasks.length})</h3>
      {activeTasks.length === 0 && <p>No active tasks.</p>}
      <ul>
        {activeTasks.map((task) => (
          <li key={task.id}>{describeTask(task)}</li>
        ))}
      </ul>

      <h3>Completed Tasks ({completedTasks.length})</h3>
      {completedTasks.length === 0 && <p>No completed tasks yet.</p>}
      <ul>
        {completedTasks.map((task) => (
          <li key={task.id}>{describeTask(task)}</li>
        ))}
      </ul>
    </div>
  );
}
