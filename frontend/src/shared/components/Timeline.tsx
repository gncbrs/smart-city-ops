import "../styles/Timeline.css";

export interface TimelineEvent {
  id: string;
  timestamp: string;
  label: string;
  onClick?: () => void;
}

interface TimelineProps {
  events: TimelineEvent[];
  emptyMessage: string;
}

export function Timeline({ events, emptyMessage }: TimelineProps) {
  if (events.length === 0) {
    return <p>{emptyMessage}</p>;
  }

  const sortedEvents = [...events].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  return (
    <ol className="timeline">
      {sortedEvents.map((event) => (
        <li key={event.id} className="timeline__item">
          <span className="timeline__time">{new Date(event.timestamp).toLocaleString()}</span>
          {event.onClick ? (
            <button type="button" className="timeline__link" onClick={event.onClick}>
              {event.label}
            </button>
          ) : (
            <span className="timeline__label">{event.label}</span>
          )}
        </li>
      ))}
    </ol>
  );
}