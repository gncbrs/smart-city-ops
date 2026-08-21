import type { Incident } from "../../incidents/types";
import type { FieldUnit } from "../../field-units/types";
import type { OperationalTask } from "../../operational-tasks/types";
import type { FieldUnitLocationHistory } from "../../field-unit-location-histories/types";
import { CompletedTasksSection } from "../../dashboard/components/CompletedTasksSection";
import { StatisticsSection } from "../../dashboard/components/StatisticsSection";
import { IncidentTimelineSection } from "../../incidents/components/IncidentTimelineSection";
import { FieldUnitMovementHistorySection } from "../../field-units/components/FieldUnitMovementHistorySection";
import type { MenuView } from "./Menu";
import "../styles/MenuSectionRouter.css";
import "../../../shared/styles/buttons.css";

const SECTIONS: { id: MenuView; label: string }[] = [
  { id: "completed-tasks", label: "Completed Tasks" },
  { id: "statistics", label: "Statistics" },
];

interface MenuSectionRouterProps {
  view: MenuView;
  onViewChange: (view: MenuView) => void;
  incidents: Incident[];
  fieldUnits: FieldUnit[];
  operationalTasks: OperationalTask[];
  timelineIncident: Incident | null;
  movementHistoryFieldUnit: FieldUnit | null;
  locationHistory: FieldUnitLocationHistory[];
  onSelectIncident: (incident: Incident) => void;
  onSelectFieldUnit: (fieldUnit: FieldUnit) => void;
}

export function MenuSectionRouter({
  view,
  onViewChange,
  incidents,
  fieldUnits,
  operationalTasks,
  timelineIncident,
  movementHistoryFieldUnit,
  locationHistory,
  onSelectIncident,
  onSelectFieldUnit,
}: MenuSectionRouterProps) {
  return (
    <>
      {view === "list" && (
        <div className="menu-overlay__section-list">
          {SECTIONS.map((section) => (
            <button
              key={section.id}
              type="button"
              className="app-button app-button--outlined"
              onClick={() => onViewChange(section.id)}
            >
              {section.label}
            </button>
          ))}
        </div>
      )}

      {view === "completed-tasks" && (
        <CompletedTasksSection
          incidents={incidents}
          fieldUnits={fieldUnits}
          operationalTasks={operationalTasks}
          onSelectIncident={onSelectIncident}
          onSelectFieldUnit={onSelectFieldUnit}
        />
      )}

      {view === "statistics" && (
        <StatisticsSection
          incidents={incidents}
          fieldUnits={fieldUnits}
          operationalTasks={operationalTasks}
          onSelectFieldUnit={onSelectFieldUnit}
        />
      )}

      {view === "timeline" &&
        (timelineIncident ? (
          <IncidentTimelineSection
            incident={timelineIncident}
            fieldUnits={fieldUnits}
            operationalTasks={operationalTasks}
            onSelectFieldUnit={onSelectFieldUnit}
          />
        ) : (
          <p>No incident selected.</p>
        ))}

      {view === "movement-history" &&
        (movementHistoryFieldUnit ? (
          <FieldUnitMovementHistorySection
            fieldUnit={movementHistoryFieldUnit}
            incidents={incidents}
            locationHistory={locationHistory}
            onSelectIncident={onSelectIncident}
          />
        ) : (
          <p>No field unit selected.</p>
        ))}
    </>
  );
}