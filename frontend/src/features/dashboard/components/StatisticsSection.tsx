import type { Incident } from "../../incidents/types";
import type { FieldUnit } from "../../field-units/types";
import type { OperationalTask } from "../../operational-tasks/types";
import { getFieldUnitLabel } from "../../operational-tasks/lib/describeTask";
import { HistoryTable, type HistoryTableRow } from "../../../shared/components/HistoryTable";
import { formatEnumLabel } from "../../../shared/lib/formatLabel";
import { formatDuration } from "../../../shared/lib/formatDuration";

interface StatisticsSectionProps {
  incidents: Incident[];
  fieldUnits: FieldUnit[];
  operationalTasks: OperationalTask[];
  onSelectFieldUnit: (fieldUnit: FieldUnit) => void;
}

export function StatisticsSection({
  incidents,
  fieldUnits,
  operationalTasks,
  onSelectFieldUnit,
}: StatisticsSectionProps) {
  const typeCounts = new Map<string, number>();
  incidents.forEach((incident) => {
    typeCounts.set(incident.type, (typeCounts.get(incident.type) ?? 0) + 1);
  });

  const incidentsByTypeRows: HistoryTableRow[] = Array.from(typeCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([type, count]) => ({
      id: type,
      cells: [{ label: formatEnumLabel(type) }, { label: String(count) }],
    }));

  const resolvedIncidents = incidents.filter(
    (incident) => incident.status === "Resolved" && incident.resolvedAt
  );

  const averageResolutionMs =
    resolvedIncidents.length > 0
      ? resolvedIncidents.reduce(
          (sum, incident) =>
            sum +
            (new Date(incident.resolvedAt as string).getTime() - new Date(incident.reportedAt).getTime()),
          0
        ) / resolvedIncidents.length
      : null;

  const completedTaskCountByUnit = new Map<string, number>();
  operationalTasks.forEach((task) => {
    if (task.status === "Completed") {
      completedTaskCountByUnit.set(task.fieldUnitId, (completedTaskCountByUnit.get(task.fieldUnitId) ?? 0) + 1);
    }
  });

  const fieldUnitWorkloadRows: HistoryTableRow[] = fieldUnits
    .map((unit) => ({ unit, count: completedTaskCountByUnit.get(unit.id) ?? 0 }))
    .sort((a, b) => b.count - a.count)
    .map(({ unit, count }) => ({
      id: unit.id,
      cells: [
        { label: getFieldUnitLabel(unit), onClick: () => onSelectFieldUnit(unit) },
        { label: String(count) },
      ],
    }));

  return (
    <div>
      <h3>Incidents by Type</h3>
      <HistoryTable
        columns={["Type", "Count"]}
        rows={incidentsByTypeRows}
        emptyMessage="No incidents yet."
      />

      <h3>Average Resolution Time</h3>
      <p>{averageResolutionMs !== null ? formatDuration(averageResolutionMs) : "N/A"}</p>

      <h3>Field Unit Workload</h3>
      <HistoryTable
        columns={["Unit", "Completed Tasks"]}
        rows={fieldUnitWorkloadRows}
        emptyMessage="No field units."
      />
    </div>
  );
}