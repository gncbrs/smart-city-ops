import type { Incident } from "../../incidents/types";
import type { FieldUnit } from "../../field-units/types";
import type { OperationalTask } from "../../operational-tasks/types";
import type { RestrictedZone } from "../../restricted-zones/types";
import type { OperationalStatistics } from "../../dashboard/types";
import { CompletedTasksSection } from "../../dashboard/components/CompletedTasksSection";
import { StatisticsSection } from "../../dashboard/components/StatisticsSection";
import { IncidentTimelineSection } from "../../incidents/components/IncidentTimelineSection";
import { FieldUnitMovementHistorySection } from "../../field-units/components/FieldUnitMovementHistorySection";
import { RestrictedZonesSection } from "../../restricted-zones/components/RestrictedZonesSection";
import type { MenuView } from "./Menu";
import "../styles/MenuSectionRouter.css";
import "../../../shared/styles/buttons.css";

const SECTIONS: { id: MenuView; label: string }[] = [
  { id: "completed-tasks", label: "Completed Tasks" },
  { id: "statistics", label: "Statistics" },
  { id: "restricted-zones", label: "Restricted Zones" },
];

interface MenuSectionRouterProps {
  view: MenuView;
  onViewChange: (view: MenuView) => void;
  incidents: Incident[];
  fieldUnits: FieldUnit[];
  operationalTasks: OperationalTask[];
  timelineIncident: Incident | null;
  movementHistoryFieldUnit: FieldUnit | null;
  restrictedZones: RestrictedZone[];
  statistics: OperationalStatistics | undefined;
  onSelectIncident: (incident: Incident) => void;
  onSelectFieldUnit: (fieldUnit: FieldUnit) => void;
  isPickingCoordinates: boolean;
  pickedCoordinates: { lat: number; lng: number } | null;
  onStartPickCoordinates: () => void;
  onCancelPickCoordinates: () => void;
  onCoordinatesApplied: () => void;
}

export function MenuSectionRouter({
  view,
  onViewChange,
  incidents,
  fieldUnits,
  operationalTasks,
  timelineIncident,
  movementHistoryFieldUnit,
  restrictedZones,
  statistics,
  onSelectIncident,
  onSelectFieldUnit,
  isPickingCoordinates,
  pickedCoordinates,
  onStartPickCoordinates,
  onCancelPickCoordinates,
  onCoordinatesApplied,
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
          statistics={statistics}
          onSelectFieldUnit={(id) => {
            const fieldUnit = fieldUnits.find((unit) => unit.id === id);
            if (fieldUnit) {
              onSelectFieldUnit(fieldUnit);
            }
          }}
        />
      )}

      {view === "timeline" && (
        <IncidentTimelineSection
          incident={timelineIncident}
          onSelectFieldUnit={(fieldUnitId) => {
            const fieldUnit = fieldUnits.find((unit) => unit.id === fieldUnitId);
            if (fieldUnit) {
              onSelectFieldUnit(fieldUnit);
            }
          }}
        />
      )}

      {view === "movement-history" && (
        <FieldUnitMovementHistorySection
          fieldUnit={movementHistoryFieldUnit}
          onSelectIncident={(incidentId) => {
            const incident = incidents.find((candidate) => candidate.id === incidentId);
            if (incident) {
              onSelectIncident(incident);
            }
          }}
        />
      )}

      {view === "restricted-zones" && (
        <RestrictedZonesSection
          zones={restrictedZones}
          isPickingCoordinates={isPickingCoordinates}
          pickedCoordinates={pickedCoordinates}
          onStartPickCoordinates={onStartPickCoordinates}
          onCancelPickCoordinates={onCancelPickCoordinates}
          onCoordinatesApplied={onCoordinatesApplied}
        />
      )}
    </>
  );
}