import type { Incident } from "../types";
import type { FieldUnit } from "../../field-units/types";
import type { OperationalTask } from "../../operational-tasks/types";
import { useResolveIncident } from "../hooks/useResolveIncident";
import { formatEnumLabel } from "../../../shared/lib/formatLabel";
import { getFieldUnitLabel } from "../../operational-tasks/lib/describeTask";
import { Timeline, type TimelineEvent } from "../../../shared/components/Timeline";

interface IncidentPanelProps {
  incident: Incident | null;
  operationalTasks: OperationalTask[];
  fieldUnits: FieldUnit[];
  onResolved: () => void;
  onSelectFieldUnit: (fieldUnit: FieldUnit) => void;
}

export function IncidentPanel({
  incident,
  operationalTasks,
  fieldUnits,
  onResolved,
  onSelectFieldUnit,
}: IncidentPanelProps) {
  const { mutate, isPending, isError } = useResolveIncident();

  if (!incident) {
    return <div>
      Select an incident point to show details of it.
      Then select a field unit to assign it.<br/>
      Color Blue for Field Units. <br />
      Other colors for Incidents.
    </div>;
  }

  const handleResolve = () => {
    mutate(incident.id, { onSuccess: onResolved });
  };

  const incidentTasks = operationalTasks.filter((task) => task.incidentId === incident.id);

  const timelineEvents: TimelineEvent[] = [
    { id: "reported", timestamp: incident.reportedAt, label: "Incident reported" },
  ];

  incidentTasks.forEach((task) => {
    const fieldUnit = fieldUnits.find((unit) => unit.id === task.fieldUnitId);
    const unitLabel = getFieldUnitLabel(fieldUnit);
    const onClick = fieldUnit ? () => onSelectFieldUnit(fieldUnit) : undefined;

    timelineEvents.push({
      id: `${task.id}-assigned`,
      timestamp: task.assignedAt,
      label: `${unitLabel} assigned`,
      onClick,
    });

    if (task.completedAt) {
      timelineEvents.push({
        id: `${task.id}-completed`,
        timestamp: task.completedAt,
        label: `${unitLabel} completed task`,
        onClick,
      });
    }
  });

  if (incident.status === "Resolved" && incident.resolvedAt) {
    timelineEvents.push({
      id: "resolved",
      timestamp: incident.resolvedAt,
      label: "Incident resolved",
    });
  }

  return (
    <div>
      <h3>{formatEnumLabel(incident.type)}</h3>
      <p>Priority: {incident.priority}</p>
      <p>Status: {formatEnumLabel(incident.status)}</p>
      <p>Description: {incident.description}</p>
      {incident.status !== "Resolved" && (
        <div>
          <button onClick={handleResolve} disabled={isPending}>
            {isPending ? "Resolving..." : "Resolve Incident"}
          </button>
          {isError && <p>Failed to resolve incident. Please try again.</p>}
        </div>
      )}

      <h4>Timeline</h4>
      <Timeline events={timelineEvents} emptyMessage="No activity yet." />
    </div>
  );
}