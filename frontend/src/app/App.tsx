import { useState } from "react";
import { OperationsCenterLayout } from "../layouts/OperationsCenterLayout";
import { IncidentPanel } from "../features/incidents/components/IncidentPanel";
import { IncidentsSummary } from "../features/incidents/components/IncidentsSummary";
import { useIncidents } from "../features/incidents/hooks/useIncidents";
import { useFieldUnits } from "../features/field-units/hooks/useFieldUnits";
import { FieldUnitPanel } from "../features/field-units/components/FieldUnitPanel";
import { AssignTaskButton } from "../features/operational-tasks/components/AssignTaskButton";
import { useOperationalTasks } from "../features/operational-tasks/hooks/useOperationalTasks";
import { Dashboard } from "../features/dashboard/components/Dashboard";
import { OperationsMap } from "../features/operations-map/components/OperationsMap";
import { FilterPanel } from "../features/operations-map/components/FilterPanel";
//import { useSignalRConnection } from "../shared/hooks/useSignalR";
import type { Incident, IncidentPriority } from "../features/incidents/types";
import type { FieldUnit, FieldUnitStatus, FieldUnitType } from "../features/field-units/types";
import { ActiveTasksPanel } from "../features/dashboard/components/ActiveTasksPanel";
import { Menu, type MenuView } from "../features/menu/components/Menu";

export function App() {
  //useSignalRConnection();

  const { data: incidents } = useIncidents();
  const { data: fieldUnits } = useFieldUnits();
  const { data: operationalTasks } = useOperationalTasks();
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [selectedFieldUnit, setSelectedFieldUnit] = useState<FieldUnit | null>(null);

  const [menuView, setMenuView] = useState<MenuView>("closed");

  const [priorityFilter, setPriorityFilter] = useState<IncidentPriority[]>([]);
  const [fieldUnitStatusFilter, setFieldUnitStatusFilter] = useState<FieldUnitStatus[]>([]);
  const [fieldUnitTypeFilter, setFieldUnitTypeFilter] = useState<FieldUnitType[]>([]);

  const togglePriority = (priority: IncidentPriority) => {
    setPriorityFilter((prev) =>
      prev.includes(priority) ? prev.filter((item) => item !== priority) : [...prev, priority]
    );
  };

  const toggleFieldUnitStatus = (status: FieldUnitStatus) => {
    setFieldUnitStatusFilter((prev) =>
      prev.includes(status) ? prev.filter((item) => item !== status) : [...prev, status]
    );
  };

  const toggleFieldUnitType = (type: FieldUnitType) => {
    setFieldUnitTypeFilter((prev) =>
      prev.includes(type) ? prev.filter((item) => item !== type) : [...prev, type]
    );
  };

  const clearSelection = () => {
    setSelectedIncident(null);
    setSelectedFieldUnit(null);
  };

  const activeTaskForSelectedFieldUnit =
    operationalTasks?.find(
      (task) => task.fieldUnitId === selectedFieldUnit?.id && task.status === "Assigned"
    ) ?? null;

  const mapIncidents = (incidents ?? []).filter(
    (incident) => priorityFilter.length === 0 || priorityFilter.includes(incident.priority)
  );

  const mapFieldUnits = (fieldUnits ?? []).filter((unit) => {
    const statusMatches = fieldUnitStatusFilter.length === 0 || fieldUnitStatusFilter.includes(unit.status);
    const typeMatches = fieldUnitTypeFilter.length === 0 || fieldUnitTypeFilter.includes(unit.type);
    return statusMatches && typeMatches;
  });

  return (
    <OperationsCenterLayout
      map={
        <OperationsMap
          incidents={mapIncidents}
          fieldUnits={mapFieldUnits}
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
          incidents={incidents ?? []}
          fieldUnits={fieldUnits ?? []}
          operationalTasks={operationalTasks ?? []}
          timelineIncident={selectedIncident}
          onSelectIncident={setSelectedIncident}
          onSelectFieldUnit={setSelectedFieldUnit}
        />
      }

      sidePanel={
        <>

          <FilterPanel
            selectedPriorities={priorityFilter}
            onTogglePriority={togglePriority}
            selectedFieldUnitStatuses={fieldUnitStatusFilter}
            onToggleFieldUnitStatus={toggleFieldUnitStatus}
            selectedFieldUnitTypes={fieldUnitTypeFilter}
            onToggleFieldUnitType={toggleFieldUnitType}
          />

          <IncidentsSummary
            count={incidents?.filter((incident) => incident.status !== "Resolved").length ?? 0}
          />

          <Dashboard incidents={incidents ?? []} fieldUnits={fieldUnits ?? []} />
        </>
      }

      fieldUnitPanel={
        <>
          <FieldUnitPanel
            fieldUnit={selectedFieldUnit}
            activeTask={activeTaskForSelectedFieldUnit}
            onCompleted={clearSelection}
          />
          {selectedIncident && selectedFieldUnit && (
            <AssignTaskButton
              incident={selectedIncident}
              fieldUnit={selectedFieldUnit}
              onAssigned={clearSelection}
            />
          )}
        </>
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
          incidents={incidents ?? []}
          fieldUnits={fieldUnits ?? []}
          operationalTasks={operationalTasks ?? []}
          onSelectIncident={setSelectedIncident}
          onSelectFieldUnit={setSelectedFieldUnit}
        />
      }

    />
  );
}
