import { useState } from "react";
import { OperationsCenterLayout } from "../layouts/OperationsCenterLayout";
import { IncidentPanel } from "../features/incidents/components/IncidentPanel";
import { OperationsMap } from "../features/operations-map/components/OperationsMap";
import { useMapFilters } from "../features/operations-map/hooks/useMapFilters";
import { filterIncidentsForMap, filterFieldUnitsForMap } from "../features/operations-map/lib/applyMapFilters";
import { useSignalRConnection } from "../shared/hooks/useSignalR";
import { useSelection } from "./hooks/useSelection";
import { useOperationsData } from "./hooks/useOperationsData";
import { OperationsSidebar } from "./components/OperationsSidebar";
import { FieldUnitColumn } from "./components/FieldUnitColumn";
import { ActiveTasksPanel } from "../features/dashboard/components/ActiveTasksPanel";
import { Menu, type MenuView } from "../features/menu/components/Menu";

export function App() {
  useSignalRConnection();

  const { incidents, fieldUnits, operationalTasks, zones, locationHistory } = useOperationsData();

  const { selectedIncident, setSelectedIncident, selectedFieldUnit, setSelectedFieldUnit, clearSelection } =
    useSelection();

  const [menuView, setMenuView] = useState<MenuView>("closed");

  const {
    priorityFilter,
    fieldUnitStatusFilter,
    fieldUnitTypeFilter,
    togglePriority,
    toggleFieldUnitStatus,
    toggleFieldUnitType,
  } = useMapFilters();

  const activeTaskForSelectedFieldUnit =
    operationalTasks.find(
      (task) => task.fieldUnitId === selectedFieldUnit?.id && task.status === "Assigned"
    ) ?? null;

  const mapIncidents = filterIncidentsForMap(incidents, priorityFilter);
  const mapFieldUnits = filterFieldUnitsForMap(fieldUnits, fieldUnitStatusFilter, fieldUnitTypeFilter);

  return (
    <OperationsCenterLayout
      map={
        <OperationsMap
          incidents={mapIncidents}
          fieldUnits={mapFieldUnits}
          zones={zones}
          selectedIncidentId={selectedIncident?.id ?? null}
          selectedFieldUnitId={selectedFieldUnit?.id ?? null}
          onSelectIncident={setSelectedIncident}
          onSelectFieldUnit={setSelectedFieldUnit}
        />
      }

      menu={
        <Menu
          view={menuView}
          onViewChange={setMenuView}
          incidents={incidents}
          fieldUnits={fieldUnits}
          operationalTasks={operationalTasks}
          timelineIncident={selectedIncident}
          movementHistoryFieldUnit={selectedFieldUnit}
          locationHistory={locationHistory}
          onSelectIncident={setSelectedIncident}
          onSelectFieldUnit={setSelectedFieldUnit}
        />
      }

      sidePanel={
        <OperationsSidebar
          incidents={incidents}
          fieldUnits={fieldUnits}
          priorityFilter={priorityFilter}
          onTogglePriority={togglePriority}
          fieldUnitStatusFilter={fieldUnitStatusFilter}
          onToggleFieldUnitStatus={toggleFieldUnitStatus}
          fieldUnitTypeFilter={fieldUnitTypeFilter}
          onToggleFieldUnitType={toggleFieldUnitType}
        />
      }

      fieldUnitPanel={
        <FieldUnitColumn
          selectedIncident={selectedIncident}
          selectedFieldUnit={selectedFieldUnit}
          activeTask={activeTaskForSelectedFieldUnit}
          onCompleted={clearSelection}
          onAssigned={clearSelection}
          onViewMovementHistory={() => setMenuView("movement-history")}
        />
      }

      incidentPanel={
        <IncidentPanel
          incident={selectedIncident}
          onResolved={clearSelection}
          onViewTimeline={() => setMenuView("timeline")}
        />
      }

      tasksPanel={
        <ActiveTasksPanel
          incidents={incidents}
          fieldUnits={fieldUnits}
          operationalTasks={operationalTasks}
          onSelectIncident={setSelectedIncident}
          onSelectFieldUnit={setSelectedFieldUnit}
        />
      }
    />
  );
} 