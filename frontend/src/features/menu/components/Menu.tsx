import type { Incident } from "../../incidents/types";
import type { FieldUnit } from "../../field-units/types";
import type { OperationalTask } from "../../operational-tasks/types";
import type { FieldUnitLocationHistory } from "../../field-unit-location-histories/types";
import type { RestrictedZone } from "../../restricted-zones/types";
import { MenuButton } from "./MenuButton";
import { MenuOverlay } from "./MenuOverlay";
import { MenuSectionRouter } from "./MenuSectionRouter";

export type MenuView =
  | "closed"
  | "list"
  | "completed-tasks"
  | "statistics"
  | "timeline"
  | "movement-history"
  | "restricted-zones";

interface MenuProps {
  view: MenuView;
  onViewChange: (view: MenuView) => void;
  incidents: Incident[];
  fieldUnits: FieldUnit[];
  operationalTasks: OperationalTask[];
  timelineIncident: Incident | null;
  movementHistoryFieldUnit: FieldUnit | null;
  locationHistory: FieldUnitLocationHistory[];
  restrictedZones: RestrictedZone[];
  onSelectIncident: (incident: Incident) => void;
  onSelectFieldUnit: (fieldUnit: FieldUnit) => void;
}

export function Menu({
  view,
  onViewChange,
  incidents,
  fieldUnits,
  operationalTasks,
  timelineIncident,
  movementHistoryFieldUnit,
  locationHistory,
  restrictedZones,
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
      <MenuButton onClick={() => onViewChange("list")} />

      <MenuOverlay
        isOpen={isOpen}
        showBackButton={view !== "list"}
        onBack={() => onViewChange("list")}
        onClose={handleClose}
      >
        <MenuSectionRouter
          view={view}
          onViewChange={onViewChange}
          incidents={incidents}
          fieldUnits={fieldUnits}
          operationalTasks={operationalTasks}
          timelineIncident={timelineIncident}
          movementHistoryFieldUnit={movementHistoryFieldUnit}
          locationHistory={locationHistory}
          restrictedZones={restrictedZones}
          onSelectIncident={handleSelectIncident}
          onSelectFieldUnit={handleSelectFieldUnit}
        />
      </MenuOverlay>
    </>
  );
}