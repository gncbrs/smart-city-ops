import type { Incident } from "../types";
import type { FieldUnit } from "../../field-units/types";
import type { OperationalTask } from "../../operational-tasks/types";
import { getFieldUnitLabel } from "../../operational-tasks/lib/describeTask";
import { formatEnumLabel } from "../../../shared/lib/formatLabel";
import { Timeline, type TimelineEvent } from "../../../shared/components/Timeline";

interface IncidentTimelineSectionProps {
  incident: Incident;
  fieldUnits: FieldUnit[];
  operationalTasks: OperationalTask[];
  onSelectFieldUnit: (fieldUnit: FieldUnit) => void;
}

export function IncidentTimelineSection({
  incident,
  fieldUnits,
  operationalTasks,
  onSelectFieldUnit,
}: IncidentTimelineSectionProps) {
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
      <h3>{formatEnumLabel(incident.type)} — Timeline</h3>
      <Timeline events={timelineEvents} emptyMessage="No activity yet." />
    </div>
  );
}