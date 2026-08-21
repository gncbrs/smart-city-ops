import type { Incident } from "../../incidents/types";
import type { FieldUnit } from "../../field-units/types";
import type { OperationalTask } from "../../operational-tasks/types";
import { getFieldUnitLabel } from "../../operational-tasks/lib/describeTask";
import type { HistoryTableRow } from "../../../shared/components/HistoryTable";
import { formatEnumLabel } from "../../../shared/lib/formatLabel";

export function buildIncidentsByTypeRows(incidents: Incident[]): HistoryTableRow[] {
  const typeCounts = new Map<string, number>();
  incidents.forEach((incident) => {
    typeCounts.set(incident.type, (typeCounts.get(incident.type) ?? 0) + 1);
  });

  return Array.from(typeCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([type, count]) => ({
      id: type,
      cells: [{ label: formatEnumLabel(type) }, { label: String(count) }],
    }));
}

export function computeAverageResolutionMs(incidents: Incident[]): number | null {
  const resolvedIncidents = incidents.filter(
    (incident) => incident.status === "Resolved" && incident.resolvedAt
  );

  return resolvedIncidents.length > 0
    ? resolvedIncidents.reduce(
        (sum, incident) =>
          sum +
          (new Date(incident.resolvedAt as string).getTime() - new Date(incident.reportedAt).getTime()),
        0
      ) / resolvedIncidents.length
    : null;
}

export function buildFieldUnitWorkloadRows(
  fieldUnits: FieldUnit[],
  operationalTasks: OperationalTask[],
  onSelectFieldUnit: (fieldUnit: FieldUnit) => void
): HistoryTableRow[] {
  const completedTaskCountByUnit = new Map<string, number>();
  operationalTasks.forEach((task) => {
    if (task.status === "Completed") {
      completedTaskCountByUnit.set(task.fieldUnitId, (completedTaskCountByUnit.get(task.fieldUnitId) ?? 0) + 1);
    }
  });

  return fieldUnits
    .map((unit) => ({ unit, count: completedTaskCountByUnit.get(unit.id) ?? 0 }))
    .sort((a, b) => b.count - a.count)
    .map(({ unit, count }) => ({
      id: unit.id,
      cells: [
        { label: getFieldUnitLabel(unit), onClick: () => onSelectFieldUnit(unit) },
        { label: String(count) },
      ],
    }));
}