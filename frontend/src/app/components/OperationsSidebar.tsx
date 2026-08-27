import type { Incident, IncidentPriority } from "../../features/incidents/types";
import type { FieldUnitStatus, FieldUnitType } from "../../features/field-units/types";
import { FilterPanel } from "../../features/operations-map/components/FilterPanel";
import { ActiveIncidentsList } from "../../features/incidents/components/ActiveIncidentsList";
import { sortActiveIncidents } from "../../features/incidents/lib/incidentPriorityScore";

interface OperationsSidebarProps {
  incidents: Incident[];
  selectedIncidentId: string | null;
  onSelectIncident: (id: string) => void;
  priorityFilter: IncidentPriority[];
  onTogglePriority: (priority: IncidentPriority) => void;
  fieldUnitStatusFilter: FieldUnitStatus[];
  onToggleFieldUnitStatus: (status: FieldUnitStatus) => void;
  fieldUnitTypeFilter: FieldUnitType[];
  onToggleFieldUnitType: (type: FieldUnitType) => void;
}

export function OperationsSidebar({
  incidents,
  selectedIncidentId,
  onSelectIncident,
  priorityFilter,
  onTogglePriority,
  fieldUnitStatusFilter,
  onToggleFieldUnitStatus,
  fieldUnitTypeFilter,
  onToggleFieldUnitType,
}: OperationsSidebarProps) {
  const filteredIncidents =
    priorityFilter.length > 0
      ? incidents.filter((incident) => priorityFilter.includes(incident.priority))
      : incidents;
  const activeIncidents = sortActiveIncidents(filteredIncidents);

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

      <ActiveIncidentsList
        incidents={activeIncidents}
        selectedIncidentId={selectedIncidentId}
        onSelectIncident={onSelectIncident}
      />
    </>
  );
}