import type { Incident, IncidentPriority } from "../../features/incidents/types";
import type { FieldUnit, FieldUnitStatus, FieldUnitType } from "../../features/field-units/types";
import { FilterPanel } from "../../features/operations-map/components/FilterPanel";
import { IncidentsSummary } from "../../features/incidents/components/IncidentsSummary";
import { Dashboard } from "../../features/dashboard/components/Dashboard";

interface OperationsSidebarProps {
  incidents: Incident[];
  fieldUnits: FieldUnit[];
  priorityFilter: IncidentPriority[];
  onTogglePriority: (priority: IncidentPriority) => void;
  fieldUnitStatusFilter: FieldUnitStatus[];
  onToggleFieldUnitStatus: (status: FieldUnitStatus) => void;
  fieldUnitTypeFilter: FieldUnitType[];
  onToggleFieldUnitType: (type: FieldUnitType) => void;
}

export function OperationsSidebar({
  incidents,
  fieldUnits,
  priorityFilter,
  onTogglePriority,
  fieldUnitStatusFilter,
  onToggleFieldUnitStatus,
  fieldUnitTypeFilter,
  onToggleFieldUnitType,
}: OperationsSidebarProps) {
  return (
    <>
      <FilterPanel
        selectedPriorities={priorityFilter}
        onTogglePriority={onTogglePriority}
        selectedFieldUnitStatuses={fieldUnitStatusFilter}
        onToggleFieldUnitStatus={onToggleFieldUnitStatus}
        selectedFieldUnitTypes={fieldUnitTypeFilter}
        onToggleFieldUnitType={onToggleFieldUnitType}
      />

      <IncidentsSummary
        count={incidents.filter((incident) => incident.status !== "Resolved").length}
      />

      <Dashboard incidents={incidents} fieldUnits={fieldUnits} />
    </>
  );
}