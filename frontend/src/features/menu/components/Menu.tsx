import { useState } from "react";
import type { Incident } from "../../incidents/types";
import type { FieldUnit } from "../../field-units/types";
import type { OperationalTask } from "../../operational-tasks/types";
import { CompletedTasksSection } from "../../dashboard/components/CompletedTasksSection";
import { StatisticsSection } from "../../dashboard/components/StatisticsSection";
import "../styles/Menu.css";

type MenuSection = "completed-tasks" | "statistics";

interface MenuProps {
  incidents: Incident[];
  fieldUnits: FieldUnit[];
  operationalTasks: OperationalTask[];
  onSelectIncident: (incident: Incident) => void;
  onSelectFieldUnit: (fieldUnit: FieldUnit) => void;
}

const SECTIONS: { id: MenuSection; label: string }[] = [
  { id: "completed-tasks", label: "Completed Tasks" },
  { id: "statistics", label: "Statistics" },
];

export function Menu({
  incidents,
  fieldUnits,
  operationalTasks,
  onSelectIncident,
  onSelectFieldUnit,
}: MenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<MenuSection | null>(null);

  const handleClose = () => {
    setIsOpen(false);
    setActiveSection(null);
  };

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
      <button type="button" className="menu-button" onClick={() => setIsOpen(true)}>
        Menu
      </button>

      {isOpen && (
        <div className="menu-overlay">
          <div className="menu-overlay__content">
            {activeSection === null ? (
              <div className="menu-overlay__section-list">
                {SECTIONS.map((section) => (
                  <button
                    key={section.id}
                    type="button"
                    className="menu-overlay__section-button"
                    onClick={() => setActiveSection(section.id)}
                  >
                    {section.label}
                  </button>
                ))}
              </div>
            ) : (
              <div>
                <button
                  type="button"
                  className="menu-overlay__back"
                  onClick={() => setActiveSection(null)}
                >
                    Back to Main Menu
                </button>

                {activeSection === "completed-tasks" && (
                  <CompletedTasksSection
                    incidents={incidents}
                    fieldUnits={fieldUnits}
                    operationalTasks={operationalTasks}
                    onSelectIncident={handleSelectIncident}
                    onSelectFieldUnit={handleSelectFieldUnit}
                  />
                )}

                {activeSection === "statistics" && (
                  <StatisticsSection
                    incidents={incidents}
                    fieldUnits={fieldUnits}
                    operationalTasks={operationalTasks}
                    onSelectFieldUnit={handleSelectFieldUnit}
                  />
                )}
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