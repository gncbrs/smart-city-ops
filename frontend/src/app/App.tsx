import { useState } from "react";
import { OperationsCenterLayout } from "../layouts/OperationsCenterLayout";
import { IncidentPanel } from "../features/incidents/components/IncidentPanel";
import { OperationsMap } from "../features/operations-map/components/OperationsMap";
import { useMapFilters } from "../features/operations-map/hooks/useMapFilters";
import { filterIncidentsForMap, filterFieldUnitsForMap } from "../features/operations-map/lib/applyMapFilters";
import { useSignalRConnection } from "../shared/hooks/useSignalR";
import { useSelection } from "./hooks/useSelection";
import { useOperationsData } from "./hooks/useOperationsData";
import { useReplayController } from "./hooks/useReplayController";
import { useOperationsSnapshot } from "../features/operations-replay/hooks/useOperationsSnapshot";
import { ReplayControlBar } from "../features/operations-replay/components/ReplayControlBar";
import { OperationsSidebar } from "./components/OperationsSidebar";
import { FieldUnitColumn } from "./components/FieldUnitColumn";
import { ActiveTasksPanel } from "../features/dashboard/components/ActiveTasksPanel";
import { Menu, type MenuView } from "../features/menu/components/Menu";

export function App() {
  useSignalRConnection();

  const liveData = useOperationsData();
  const { zones, locationHistory, restrictedZones } = liveData;

  const { selectedIncident, setSelectedIncident, selectedFieldUnit, setSelectedFieldUnit, clearSelection } =
    useSelection();

  const replay = useReplayController();
  const { data: snapshot, isFetching: isSnapshotLoading } = useOperationsSnapshot(
    replay.timestamp,
    replay.isReplayMode
  );

  const handleEnterReplay = () => {
    clearSelection();
    replay.enterReplayMode();
  };

  const handleExitReplay = () => {
    clearSelection();
    replay.exitReplayMode();
  };

  const incidents = replay.isReplayMode && snapshot ? snapshot.incidents : liveData.incidents;
  const fieldUnits = replay.isReplayMode && snapshot ? snapshot.fieldUnits : liveData.fieldUnits;
  const operationalTasks = replay.isReplayMode && snapshot ? snapshot.activeTasks : liveData.operationalTasks;

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

  const availableFieldUnitsForReassignment = fieldUnits.filter(
    (fieldUnit) => fieldUnit.status === "Available"
  );

  const mapIncidents = filterIncidentsForMap(incidents, priorityFilter);
  const mapFieldUnits = filterFieldUnitsForMap(fieldUnits, fieldUnitStatusFilter, fieldUnitTypeFilter);

  return (
    <OperationsCenterLayout
      map={
        <>
          <OperationsMap
            incidents={mapIncidents}
            fieldUnits={mapFieldUnits}
            zones={zones}
            restrictedZones={restrictedZones}
            operationalTasks={operationalTasks}
            selectedIncidentId={selectedIncident?.id ?? null}
            selectedFieldUnitId={selectedFieldUnit?.id ?? null}
            onSelectIncident={setSelectedIncident}
            onSelectFieldUnit={setSelectedFieldUnit}
          />
          <ReplayControlBar
            mode={replay.mode}
            onEnterReplay={handleEnterReplay}
            onExitReplay={handleExitReplay}
            minTimestamp={replay.minTimestamp}
            maxTimestamp={replay.maxTimestamp}
            timestamp={replay.timestamp}
            onScrub={replay.scrubTo}
            isPlaying={replay.isPlaying}
            onTogglePlayback={replay.togglePlayback}
            speed={replay.speed}
            onSpeedChange={replay.setSpeed}
            isLoading={isSnapshotLoading}
          />
        </>
      }

      menu={
        <Menu
          view={menuView}
          onViewChange={setMenuView}
          incidents={liveData.incidents}
          fieldUnits={liveData.fieldUnits}
          operationalTasks={liveData.operationalTasks}
          timelineIncident={selectedIncident}
          movementHistoryFieldUnit={selectedFieldUnit}
          locationHistory={locationHistory}
          restrictedZones={restrictedZones}
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
          availableFieldUnitsForReassignment={availableFieldUnitsForReassignment}
          onCompleted={clearSelection}
          onAssigned={clearSelection}
          onReassigned={clearSelection}
          onViewMovementHistory={() => setMenuView("movement-history")}
          readOnly={replay.isReplayMode}
        />
      }

      incidentPanel={
        <IncidentPanel
          incident={selectedIncident}
          fieldUnits={fieldUnits}
          selectedFieldUnitId={selectedFieldUnit?.id ?? null}
          onResolved={clearSelection}
          onViewTimeline={() => setMenuView("timeline")}
          onSelectFieldUnit={setSelectedFieldUnit}
          readOnly={replay.isReplayMode}
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