import type { IncidentPriority } from "../../incidents/types";
import type { FieldUnitStatus, FieldUnitType } from "../../field-units/types";
import { FilterCheckboxGroup } from "./FilterCheckboxGroup";
import "../styles/FilterPanel.css";

const ALL_PRIORITIES: IncidentPriority[] = ["High", "Medium", "Low"];
const ALL_FIELD_UNIT_STATUSES: FieldUnitStatus[] = ["Available", "Dispatched", "OutOfService"];
const ALL_FIELD_UNIT_TYPES: FieldUnitType[] = ["Police", "Medical", "Fire", "UtilityCrew", "TrafficControl"];

interface FilterPanelProps {
  selectedPriorities: IncidentPriority[];
  onTogglePriority: (priority: IncidentPriority) => void;
  selectedFieldUnitStatuses: FieldUnitStatus[];
  onToggleFieldUnitStatus: (status: FieldUnitStatus) => void;
  selectedFieldUnitTypes: FieldUnitType[];
  onToggleFieldUnitType: (type: FieldUnitType) => void;
}

export function FilterPanel({
  selectedPriorities,
  onTogglePriority,
  selectedFieldUnitStatuses,
  onToggleFieldUnitStatus,
  selectedFieldUnitTypes,
  onToggleFieldUnitType,
}: FilterPanelProps) {
  return (
    <div className="filter-panel">
      <h3>Map Filters</h3>

      <FilterCheckboxGroup
        label="Incident Priority"
        options={ALL_PRIORITIES}
        selectedOptions={selectedPriorities}
        onToggle={onTogglePriority}
      />

      <FilterCheckboxGroup
        label="Field Unit Status"
        options={ALL_FIELD_UNIT_STATUSES}
        selectedOptions={selectedFieldUnitStatuses}
        onToggle={onToggleFieldUnitStatus}
      />

      <FilterCheckboxGroup
        label="Field Unit Type"
        options={ALL_FIELD_UNIT_TYPES}
        selectedOptions={selectedFieldUnitTypes}
        onToggle={onToggleFieldUnitType}
      />
    </div>
  );
}