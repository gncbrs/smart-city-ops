import { useIncidents } from "../../features/incidents/hooks/useIncidents";
import { useFieldUnits } from "../../features/field-units/hooks/useFieldUnits";
import { useOperationalTasks } from "../../features/operational-tasks/hooks/useOperationalTasks";
import { useOperationalZones } from "../../features/operational-zones/hooks/useOperationalZones";
import { useFieldUnitLocationHistories } from "../../features/field-unit-location-histories/hooks/useFieldUnitLocationHistories";

export function useOperationsData() {
  const { data: incidents } = useIncidents();
  const { data: fieldUnits } = useFieldUnits();
  const { data: operationalTasks } = useOperationalTasks();
  const { data: zones } = useOperationalZones();
  const { data: locationHistory } = useFieldUnitLocationHistories();

  return {
    incidents: incidents ?? [],
    fieldUnits: fieldUnits ?? [],
    operationalTasks: operationalTasks ?? [],
    zones: zones ?? [],
    locationHistory: locationHistory ?? [],
  };
}