export interface FieldUnitLocationHistory {
  id: string;
  fieldUnitId: string;
  incidentId: string | null;
  latitude: number;
  longitude: number;
  recordedAt: string;
}