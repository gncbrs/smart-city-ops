import type { Incident, IncidentStatus } from "../types";
import { formatEnumLabel } from "../../../shared/lib/formatLabel";
import "../styles/ActiveIncidentsList.css";

interface ActiveIncidentsListProps {
  incidents: Incident[];
  selectedIncidentId: string | null;
  onSelectIncident: (id: string) => void;
}

const STATUS_LABELS: Record<IncidentStatus, string> = {
  Open: "Reported",
  InProgress: "In Progress",
  Resolved: "Resolved",
};

export function ActiveIncidentsList({ incidents, selectedIncidentId, onSelectIncident }: ActiveIncidentsListProps) {
  return (
    <div className="active-incidents-list">
      <h3 className="active-incidents-list__header">Active Incidents ({incidents.length})</h3>

      {incidents.length === 0 ? (
        <p className="active-incidents-list__empty">No active incidents matching filters.</p>
      ) : (
        <ul className="active-incidents-list__items">
          {incidents.map((incident) => {
            const isSelected = incident.id === selectedIncidentId;
            const reportedDate = new Date(incident.reportedAt);
            const reportedTime = `${reportedDate.toLocaleDateString([], {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            }).replace(/\//g, ".")} ${reportedDate.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}`;

            return (
              <li key={incident.id} className="active-incidents-list__item">
                <button
                  type="button"
                  className={`active-incidents-list__card${
                    isSelected ? " active-incidents-list__card--selected" : ""
                  }`}
                  onClick={() => onSelectIncident(incident.id)}
                  aria-pressed={isSelected}
                >
                  <div className="active-incidents-list__card-header">
                    <span className="active-incidents-list__type">{formatEnumLabel(incident.type)}</span>
                    <span
                      className={`active-incidents-list__priority-badge active-incidents-list__priority-badge--${incident.priority.toLowerCase()}`}
                    >
                      {incident.priority}
                    </span>
                  </div>

                  <div className="active-incidents-list__card-footer">
                    <span className="active-incidents-list__status-badge">{STATUS_LABELS[incident.status]}</span>
                    <span className="active-incidents-list__time">{reportedTime}</span>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
