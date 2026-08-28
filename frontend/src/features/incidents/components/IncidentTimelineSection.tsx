import type { Incident } from "../types";
import { useIncidentTimeline } from "../hooks/useIncidentTimeline";
import { formatEnumLabel } from "../../../shared/lib/formatLabel";
import { Timeline, type TimelineEvent } from "../../../shared/components/Timeline";

interface IncidentTimelineSectionProps {
  incident: Incident | null;
  onSelectFieldUnit: (fieldUnitId: string) => void;
}

export function IncidentTimelineSection({ incident, onSelectFieldUnit }: IncidentTimelineSectionProps) {
  const { data: events = [] } = useIncidentTimeline(incident?.id);

  if (!incident) {
    return <p>No incident selected.</p>;
  }

  const timelineEvents: TimelineEvent[] = events.map((event) => ({
    id: event.id,
    timestamp: event.timestamp,
    label: event.description,
    onClick: event.fieldUnitId ? () => onSelectFieldUnit(event.fieldUnitId!) : undefined,
  }));

  return (
    <div>
      <h3>{formatEnumLabel(incident.type)} — Timeline</h3>
      <Timeline events={timelineEvents} emptyMessage="No activity yet." />
    </div>
  );
}
