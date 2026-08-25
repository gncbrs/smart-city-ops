import { useCallback, useState } from "react";
import type { Incident } from "../../features/incidents/types";
import type { FieldUnit } from "../../features/field-units/types";

export function useSelection() {
  const [selectedIncident, setSelectedIncidentState] = useState<Incident | null>(null);
  const [selectedFieldUnit, setSelectedFieldUnitState] = useState<FieldUnit | null>(null);

  const setSelectedIncident = useCallback((incident: Incident) => {
    setSelectedIncidentState((current) => (current?.id === incident.id ? null : incident));
  }, []);

  const setSelectedFieldUnit = useCallback((fieldUnit: FieldUnit) => {
    setSelectedFieldUnitState((current) => (current?.id === fieldUnit.id ? null : fieldUnit));
  }, []);

  const deselectIncident = useCallback(() => setSelectedIncidentState(null), []);
  const deselectFieldUnit = useCallback(() => setSelectedFieldUnitState(null), []);

  const clearSelection = () => {
    setSelectedIncidentState(null);
    setSelectedFieldUnitState(null);
  };

  return {
    selectedIncident,
    setSelectedIncident,
    deselectIncident,
    selectedFieldUnit,
    setSelectedFieldUnit,
    deselectFieldUnit,
    clearSelection,
  };
}
