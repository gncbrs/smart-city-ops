import { useState } from "react";
import type { IncidentPriority } from "../../incidents/types";
import type { FieldUnitStatus, FieldUnitType } from "../../field-units/types";

export function useMapFilters() {
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

  return {
    priorityFilter,
    fieldUnitStatusFilter,
    fieldUnitTypeFilter,
    togglePriority,
    toggleFieldUnitStatus,
    toggleFieldUnitType,
  };
}