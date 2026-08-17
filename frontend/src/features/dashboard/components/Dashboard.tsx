import type { Incident } from "../../incidents/types";
import type { FieldUnit } from "../../field-units/types";
import type { OperationalTask } from "../../operational-tasks/types";
import {
  getFieldUnitLabel,
  getIncidentLabel,
  MANUAL_RESOLVE_UNIT_LABEL,
} from "../../operational-tasks/lib/describeTask";
import { HistoryTable, type HistoryTableCell, type HistoryTableRow } from "../../../shared/components/HistoryTable";
import { formatEnumLabel } from "../../../shared/lib/formatLabel";
import { formatDuration } from "../../../shared/lib/formatDuration";

interface DashboardProps {
  incidents: Incident[];
  fieldUnits: FieldUnit[];
  operationalTasks: OperationalTask[];
  onSelectIncident: (incident: Incident) => void;
  onSelectFieldUnit: (fieldUnit: FieldUnit) => void;
}

interface HistoryRow {
  id: string;
  cells: HistoryTableCell[];
  timestamp: string;
}

export function Dashboard({
  incidents,
  fieldUnits,
  operationalTasks,
  onSelectIncident,
  onSelectFieldUnit,
}: DashboardProps) {
  const availableCount = fieldUnits.filter((unit) => unit.status === "Available").length;
  const dispatchedCount = fieldUnits.filter((unit) => unit.status === "Dispatched").length;
  const outOfServiceCount = fieldUnits.filter((unit) => unit.status === "OutOfService").length;

  const highPriorityActiveCount = incidents.filter(
    (incident) => incident.priority === "High" && incident.status !== "Resolved"
  ).length;

  const buildTaskCells = (task: OperationalTask): HistoryTableCell[] => {
    const fieldUnit = fieldUnits.find((unit) => unit.id === task.fieldUnitId);
    const incident = incidents.find((item) => item.id === task.incidentId);

    return [
      {
        label: getFieldUnitLabel(fieldUnit),
        onClick: fieldUnit ? () => onSelectFieldUnit(fieldUnit) : undefined,
      },
      {
        label: getIncidentLabel(incident),
        onClick: incident ? () => onSelectIncident(incident) : undefined,
      },
    ];
  };

  const activeTaskRows: HistoryRow[] = operationalTasks
    .filter((task) => task.status === "Assigned")
    .map((task) => ({
      id: task.id,
      cells: [...buildTaskCells(task), { label: new Date(task.assignedAt).toLocaleString() }],
      timestamp: task.assignedAt,
    }))
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const completedTaskRows: HistoryRow[] = operationalTasks
    .filter((task) => task.status === "Completed" && task.completedAt)
    .map((task) => ({
      id: task.id,
      cells: [...buildTaskCells(task), { label: new Date(task.completedAt as string).toLocaleString() }],
      timestamp: task.completedAt as string,
    }));

  const incidentIdsWithTasks = new Set(operationalTasks.map((task) => task.incidentId));

  const manualResolveRows: HistoryRow[] = incidents
    .filter(
      (incident) =>
        incident.status === "Resolved" &&
        incident.resolvedAt &&
        !incidentIdsWithTasks.has(incident.id)
    )
    .map((incident) => ({
      id: incident.id,
      cells: [
        { label: MANUAL_RESOLVE_UNIT_LABEL },
        { label: getIncidentLabel(incident), onClick: () => onSelectIncident(incident) },
        { label: new Date(incident.resolvedAt as string).toLocaleString() },
      ],
      timestamp: incident.resolvedAt as string,
    }));

  const completedHistoryRows = [...completedTaskRows, ...manualResolveRows].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  // --- İstatistikler ---

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
      <h2>Operational State</h2>
      <p>High Priority Active Incidents: {highPriorityActiveCount}</p>

      <h3>Field Units</h3>
      <p>Available: {availableCount}</p>
      <p>Dispatched: {dispatchedCount}</p>
      <p>Out of Service: {outOfServiceCount}</p>

      <h3>Active Tasks ({activeTaskRows.length})</h3>
      <HistoryTable
        columns={["Unit", "Incident", "Assigned At"]}
        rows={activeTaskRows}
        emptyMessage="No active tasks."
      />

      <h3>Completed Tasks ({completedHistoryRows.length})</h3>
      <HistoryTable
        columns={["Unit", "Incident", "Completed At"]}
        rows={completedHistoryRows}
        emptyMessage="No completed tasks yet."
      />

      <h2>Statistics</h2>

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