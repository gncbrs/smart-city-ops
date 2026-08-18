import type { IncidentPriority } from "../../incidents/types";
import type { FieldUnitStatus, FieldUnitType } from "../../field-units/types";
import { formatEnumLabel } from "../../../shared/lib/formatLabel";
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

      <div className="filter-panel__group">
        <span className="filter-panel__group-label">Incident Priority</span>
        {ALL_PRIORITIES.map((priority) => (
          <label key={priority} className="filter-panel__option">
            <input
              type="checkbox"
              checked={selectedPriorities.includes(priority)}
              onChange={() => onTogglePriority(priority)}
            />
            {formatEnumLabel(priority)}
          </label>
        ))}
      </div>

      <div className="filter-panel__group">
        <span className="filter-panel__group-label">Field Unit Status</span>
        {ALL_FIELD_UNIT_STATUSES.map((status) => (
          <label key={status} className="filter-panel__option">
            <input
              type="checkbox"
              checked={selectedFieldUnitStatuses.includes(status)}
              onChange={() => onToggleFieldUnitStatus(status)}
            />
            {formatEnumLabel(status)}
          </label>
        ))}
      </div>

      <div className="filter-panel__group">
        <span className="filter-panel__group-label">Field Unit Type</span>
        {ALL_FIELD_UNIT_TYPES.map((type) => (
          <label key={type} className="filter-panel__option">
            <input
              type="checkbox"
              checked={selectedFieldUnitTypes.includes(type)}
              onChange={() => onToggleFieldUnitType(type)}
            />
            {formatEnumLabel(type)}
          </label>
        ))}
      </div>
    </div>
  );
}