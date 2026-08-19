import type { Incident } from "../../incidents/types";
import type { FieldUnit } from "../../field-units/types";
import type { OperationalTask } from "../../operational-tasks/types";
import { CompletedTasksSection } from "../../dashboard/components/CompletedTasksSection";
import { StatisticsSection } from "../../dashboard/components/StatisticsSection";
import { IncidentTimelineSection } from "../../incidents/components/IncidentTimelineSection";
import "../styles/Menu.css";

export type MenuView = "closed" | "list" | "completed-tasks" | "statistics" | "timeline";

interface MenuProps {
  view: MenuView;
  onViewChange: (view: MenuView) => void;
  incidents: Incident[];
  fieldUnits: FieldUnit[];
  operationalTasks: OperationalTask[];
  timelineIncident: Incident | null;
  onSelectIncident: (incident: Incident) => void;
  onSelectFieldUnit: (fieldUnit: FieldUnit) => void;
}

const SECTIONS: { id: MenuView; label: string }[] = [
  { id: "completed-tasks", label: "Completed Tasks" },
  { id: "statistics", label: "Statistics" },
];

export function Menu({
  view,
  onViewChange,
  incidents,
  fieldUnits,
  operationalTasks,
  timelineIncident,
  onSelectIncident,
  onSelectFieldUnit,
}: MenuProps) {
  const isOpen = view !== "closed";

  const handleClose = () => onViewChange("closed");

  const handleSelectIncident = (incident: Incident) => {
    onSelectIncident(incident);
    handleClose();
  };

  const handleSelectFieldUnit = (fieldUnit: FieldUnit) => {
    onSelectFieldUnit(fieldUnit);
    handleClose();
  };

  return (
    <>
      <button type="button" className="menu-button" onClick={() => onViewChange("list")}>
        Menu
      </button>

      {isOpen && (
        <div className="menu-overlay">
          <div className="menu-overlay__content">
            {view === "list" && (
              <div className="menu-overlay__section-list">
                {SECTIONS.map((section) => (
                  <button
                    key={section.id}
                    type="button"
                    className="menu-overlay__section-button"
                    onClick={() => onViewChange(section.id)}
                  >
                    {section.label}
                  </button>
                ))}
              </div>
            )}

            {view !== "list" && (
              <div>
                <button
                  type="button"
                  className="menu-overlay__back"
                  onClick={() => onViewChange("list")}
                >
                  ← Back to Menu
                </button>

                {view === "completed-tasks" && (
                  <CompletedTasksSection
                    incidents={incidents}
                    fieldUnits={fieldUnits}
                    operationalTasks={operationalTasks}
                    onSelectIncident={handleSelectIncident}
                    onSelectFieldUnit={handleSelectFieldUnit}
                  />
                )}

                {view === "statistics" && (
                  <StatisticsSection
                    incidents={incidents}
                    fieldUnits={fieldUnits}
                    operationalTasks={operationalTasks}
                    onSelectFieldUnit={handleSelectFieldUnit}
                  />
                )}

                {view === "timeline" &&
                  (timelineIncident ? (
                    <IncidentTimelineSection
                      incident={timelineIncident}
                      fieldUnits={fieldUnits}
                      operationalTasks={operationalTasks}
                      onSelectFieldUnit={handleSelectFieldUnit}
                    />
                  ) : (
                    <p>No incident selected.</p>
                  ))}
              </div>
            )}

            <button type="button" className="menu-overlay__close" onClick={handleClose}>
              Kapat
            </button>
          </div>
        </div>
      )}
    </>
  );
}