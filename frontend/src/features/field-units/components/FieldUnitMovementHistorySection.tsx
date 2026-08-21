import type { FieldUnit } from "../types";
import type { Incident } from "../../incidents/types";
import type { FieldUnitLocationHistory } from "../../field-unit-location-histories/types";
import { getIncidentLabel } from "../../operational-tasks/lib/describeTask";
import { formatEnumLabel } from "../../../shared/lib/formatLabel";
import { Timeline, type TimelineEvent } from "../../../shared/components/Timeline";

interface FieldUnitMovementHistorySectionProps {
  fieldUnit: FieldUnit;
  incidents: Incident[];
  locationHistory: FieldUnitLocationHistory[];
  onSelectIncident: (incident: Incident) => void;
}

export function FieldUnitMovementHistorySection({
  fieldUnit,
  incidents,
  locationHistory,
  onSelectIncident,
}: FieldUnitMovementHistorySectionProps) {
  const unitHistory = locationHistory.filter((entry) => entry.fieldUnitId === fieldUnit.id);

  const timelineEvents: TimelineEvent[] = unitHistory.map((entry) => {
    const incident = incidents.find((candidate) => candidate.id === entry.incidentId);
    const onClick = incident ? () => onSelectIncident(incident) : undefined;

    return {
      id: entry.id,
      timestamp: entry.recordedAt,
      label: `Dispatched to ${getIncidentLabel(incident)}`,
      onClick,
    };
  });

  return (
    <div>
      <h3>{formatEnumLabel(fieldUnit.type)} ({fieldUnit.unitCode}) — Movement History</h3>
      <Timeline events={timelineEvents} emptyMessage="No movement recorded yet." />
    </div>
  );
}