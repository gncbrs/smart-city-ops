import type { FieldUnit } from "../types";
import { useFieldUnitMovementHistory } from "../hooks/useFieldUnitMovementHistory";
import { formatEnumLabel } from "../../../shared/lib/formatLabel";
import { Timeline, type TimelineEvent } from "../../../shared/components/Timeline";

interface FieldUnitMovementHistorySectionProps {
  fieldUnit: FieldUnit | null;
  onSelectIncident: (incidentId: string) => void;
}

export function FieldUnitMovementHistorySection({
  fieldUnit,
  onSelectIncident,
}: FieldUnitMovementHistorySectionProps) {
  const { data: records = [] } = useFieldUnitMovementHistory(fieldUnit?.id);

  if (!fieldUnit) {
    return <p>No field unit selected.</p>;
  }

  const timelineEvents: TimelineEvent[] = records.map((record) => ({
    id: record.id,
    timestamp: record.timestamp,
    label: record.incidentType ? `Dispatched to ${formatEnumLabel(record.incidentType)}` : "Position update",
    onClick: record.incidentId ? () => onSelectIncident(record.incidentId!) : undefined,
  }));

  return (
    <div>
      <h3>{formatEnumLabel(fieldUnit.type)} ({fieldUnit.unitCode}) — Movement History</h3>
      <Timeline events={timelineEvents} emptyMessage="No movement recorded yet." />
    </div>
  );
}
