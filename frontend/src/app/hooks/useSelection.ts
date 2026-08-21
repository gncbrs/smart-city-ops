import { useState } from "react";
import type { Incident } from "../../features/incidents/types";
import type { FieldUnit } from "../../features/field-units/types";

export function useSelection() {
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [selectedFieldUnit, setSelectedFieldUnit] = useState<FieldUnit | null>(null);

  const clearSelection = () => {
    setSelectedIncident(null);
    setSelectedFieldUnit(null);
  };

  return {
    selectedIncident,
    setSelectedIncident,
    selectedFieldUnit,
    setSelectedFieldUnit,
    clearSelection,
  };
}