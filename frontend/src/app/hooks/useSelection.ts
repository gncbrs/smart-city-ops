import { useCallback, useState } from "react";

type IdSetter = (id: string | null | ((prev: string | null) => string | null)) => void;

export function useSelection() {
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  const [selectedFieldUnitId, setSelectedFieldUnitId] = useState<string | null>(null);

  const setSelectedIncidentIdCallback: IdSetter = useCallback((id) => {
    setSelectedIncidentId(id);
  }, []);

  const setSelectedFieldUnitIdCallback: IdSetter = useCallback((id) => {
    setSelectedFieldUnitId(id);
  }, []);

  const toggleIncidentSelection = useCallback((id: string) => {
    setSelectedIncidentId((current) => (current === id ? null : id));
  }, []);

  const toggleFieldUnitSelection = useCallback((id: string) => {
    setSelectedFieldUnitId((current) => (current === id ? null : id));
  }, []);

  const selectIncident = useCallback((id: string) => {
    setSelectedIncidentId(id);
  }, []);

  const selectFieldUnit = useCallback((id: string) => {
    setSelectedFieldUnitId(id);
  }, []);

  const deselectIncident = useCallback(() => setSelectedIncidentId(null), []);
  const deselectFieldUnit = useCallback(() => setSelectedFieldUnitId(null), []);

  const clearSelection = useCallback(() => {
    setSelectedIncidentId(null);
    setSelectedFieldUnitId(null);
  }, []);

  return {
    selectedIncidentId,
    setSelectedIncidentId: setSelectedIncidentIdCallback,
    toggleIncidentSelection,
    selectIncident,
    deselectIncident,
    selectedFieldUnitId,
    setSelectedFieldUnitId: setSelectedFieldUnitIdCallback,
    toggleFieldUnitSelection,
    selectFieldUnit,
    deselectFieldUnit,
    clearSelection,
  };
}
