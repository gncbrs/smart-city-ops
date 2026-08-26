import { lazy, Suspense, useState } from "react";
import { OperationsCenterLayout } from "../layouts/OperationsCenterLayout";
import { IncidentPanel } from "../features/incidents/components/IncidentPanel";
import { useMapFilters } from "../features/operations-map/hooks/useMapFilters";
import { filterIncidentsForMap, filterFieldUnitsForMap } from "../features/operations-map/lib/applyMapFilters";
import { useSignalRConnection } from "../shared/hooks/useSignalR";
import { useSelection } from "./hooks/useSelection";
import { useOperationsData } from "./hooks/useOperationsData";
import { useReplayController } from "./hooks/useReplayController";
import { useReplayAwareData } from "./hooks/useReplayAwareData";
import { useCoordinatePicker } from "./hooks/useCoordinatePicker";
import { useOperationsSnapshot } from "../features/operations-replay/hooks/useOperationsSnapshot";
import { ReplayControlBar } from "../features/operations-replay/components/ReplayControlBar";
import { OperationsSidebar } from "./components/OperationsSidebar";
import { FieldUnitColumn } from "./components/FieldUnitColumn";
import { ActiveTasksPanel } from "../features/dashboard/components/ActiveTasksPanel";
import { Menu, type MenuView } from "../features/menu/components/Menu";
import { CoordinatePickerBanner } from "../features/restricted-zones/components/CoordinatePickerBanner";
import { getActiveTaskForFieldUnit, getAvailableFieldUnits } from "./lib/operationsSelectors";

const OperationsMap = lazy(() =>
  import("../features/operations-map/components/OperationsMap").then((module) => ({
    default: module.OperationsMap,
  }))
);

function MapLoadingPlaceholder() {
  return <div className="map-loading-placeholder">Loading Map...</div>;
}

export function App() {
  useSignalRConnection();

  const liveData = useOperationsData();
  const { zones, locationHistory } = liveData;

  const {
    selectedIncident,
    setSelectedIncident,
    deselectIncident,
    selectedFieldUnit,
    setSelectedFieldUnit,
    deselectFieldUnit,
    clearSelection,
  } = useSelection();

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

  const { incidents, fieldUnits, operationalTasks, restrictedZones } = useReplayAwareData(
    liveData,
    replay,
    snapshot
  );

  const [menuView, setMenuView] = useState<MenuView>("closed");

  const coordinatePicker = useCoordinatePicker();

  const handleStartPickCoordinates = () => {
    coordinatePicker.startPicking();
    setMenuView("closed");
  };

  const handleCancelPickCoordinates = () => {
    coordinatePicker.cancelPicking();
    setMenuView("restricted-zones");
  };

  const handlePickCoordinates = (coordinates: { lat: number; lng: number }) => {
    coordinatePicker.pickCoordinates(coordinates.lat, coordinates.lng);
    setMenuView("restricted-zones");
  };

  const {
    priorityFilter,
    fieldUnitStatusFilter,
    fieldUnitTypeFilter,
    togglePriority,
    toggleFieldUnitStatus,
    toggleFieldUnitType,
  } = useMapFilters();

  const activeTaskForSelectedFieldUnit =
    getActiveTaskForFieldUnit(selectedFieldUnit?.id, operationalTasks) ?? null;

  const availableFieldUnitsForReassignment = getAvailableFieldUnits(fieldUnits);

  const mapIncidents = filterIncidentsForMap(incidents, priorityFilter);
  const mapFieldUnits = filterFieldUnitsForMap(fieldUnits, fieldUnitStatusFilter, fieldUnitTypeFilter);

  return (
    <OperationsCenterLayout
      map={
        <>
          <Suspense fallback={<MapLoadingPlaceholder />}>
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
              onClearSelection={clearSelection}
              isPickingCoordinates={coordinatePicker.isPickingCoordinates}
              onPickCoordinates={handlePickCoordinates}
            />
          </Suspense>
          {coordinatePicker.isPickingCoordinates && (
            <CoordinatePickerBanner onCancel={handleCancelPickCoordinates} />
          )}
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
          isPickingCoordinates={coordinatePicker.isPickingCoordinates}
          pickedCoordinates={coordinatePicker.pickedCoordinates}
          onStartPickCoordinates={handleStartPickCoordinates}
          onCancelPickCoordinates={handleCancelPickCoordinates}
          onCoordinatesApplied={coordinatePicker.consumePickedCoordinates}
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
          onClose={deselectFieldUnit}
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
          onClose={deselectIncident}
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