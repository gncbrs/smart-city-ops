import type { Incident } from "../../incidents/types";
import type { FieldUnit } from "../../field-units/types";
import { formatEnumLabel } from "../../../shared/lib/formatLabel";

export const MANUAL_RESOLVE_UNIT_LABEL = "Operator";

export function getFieldUnitLabel(fieldUnit: FieldUnit | undefined): string {
  return fieldUnit ? `${formatEnumLabel(fieldUnit.type)} (${fieldUnit.unitCode})` : "Unknown unit";
}

export function getIncidentLabel(incident: Incident | undefined): string {
  return incident ? formatEnumLabel(incident.type) : "Unknown incident";
}