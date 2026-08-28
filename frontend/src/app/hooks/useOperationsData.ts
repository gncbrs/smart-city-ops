import { useIncidents } from "../../features/incidents/hooks/useIncidents";
import { useFieldUnits } from "../../features/field-units/hooks/useFieldUnits";
import { useOperationalTasks } from "../../features/operational-tasks/hooks/useOperationalTasks";
import { useOperationalZones } from "../../features/operational-zones/hooks/useOperationalZones";
import { useFieldUnitLocationHistories } from "../../features/field-unit-location-histories/hooks/useFieldUnitLocationHistories";
import { useRestrictedZones } from "../../features/restricted-zones/hooks/useRestrictedZones";
import { useOperationalStatistics } from "../../features/dashboard/hooks/useOperationalStatistics";

export function useOperationsData() {
  const { data: incidents } = useIncidents();
  const { data: fieldUnits } = useFieldUnits();
  const { data: operationalTasks } = useOperationalTasks();
  const { data: zones } = useOperationalZones();
  const { data: locationHistory } = useFieldUnitLocationHistories();
  const { data: restrictedZones } = useRestrictedZones();
  const { data: statistics } = useOperationalStatistics();

  return {
    incidents: incidents ?? [],
    fieldUnits: fieldUnits ?? [],
    operationalTasks: operationalTasks ?? [],
    zones: zones ?? [],
    locationHistory: locationHistory ?? [],
    restrictedZones: restrictedZones ?? [],
    statistics,
  };
}