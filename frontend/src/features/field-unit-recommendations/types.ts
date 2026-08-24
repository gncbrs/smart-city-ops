export interface FieldUnitRecommendation {
  fieldUnitId: string;
  unitCode: string;
  unitType: string;
  status: string;
  distanceKm: number;
  estimatedEtaMinutes: number;
  totalScore: number;
  matchReasons: string[];
}
