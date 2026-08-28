export interface IncidentTypeCount {
  type: string;
  count: number;
}

export interface FieldUnitWorkload {
  fieldUnitId: string;
  unitCode: string;
  unitType: string;
  completedTaskCount: number;
}

export interface OperationalStatistics {
  activeIncidentsCount: number;
  highPriorityActiveIncidentsCount: number;
  availableFieldUnitsCount: number;
  dispatchedFieldUnitsCount: number;
  outOfServiceFieldUnitsCount: number;
  averageResolutionMinutes: number | null;
  incidentsByType: IncidentTypeCount[];
  fieldUnitWorkload: FieldUnitWorkload[];
}
