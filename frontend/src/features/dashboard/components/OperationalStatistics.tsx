import type { Incident } from "../../incidents/types";
import type { FieldUnit } from "../../field-units/types";
import type { OperationalTask } from "../../operational-tasks/types";
import { buildCompletedHistoryRows } from "../../operational-tasks/lib/buildTaskRow";
import {
  buildIncidentsByTypeRows,
  computeAverageResolutionMs,
  buildFieldUnitWorkloadRows,
} from "../lib/buildOperationalStatistics";
import { HistoryTable } from "../../../shared/components/HistoryTable";
import { formatDuration } from "../../../shared/lib/formatDuration";

interface OperationalStatisticsProps {
  incidents: Incident[];
  fieldUnits: FieldUnit[];
  operationalTasks: OperationalTask[];
  onSelectIncident: (incident: Incident) => void;
  onSelectFieldUnit: (fieldUnit: FieldUnit) => void;
}

export function OperationalStatistics({
  incidents,
  fieldUnits,
  operationalTasks,
  onSelectIncident,
  onSelectFieldUnit,
}: OperationalStatisticsProps) {
  const completedHistoryRows = buildCompletedHistoryRows(
    operationalTasks,
    fieldUnits,
    incidents,
    onSelectFieldUnit,
    onSelectIncident
  );

  const incidentsByTypeRows = buildIncidentsByTypeRows(incidents);
  const averageResolutionMs = computeAverageResolutionMs(incidents);
  const fieldUnitWorkloadRows = buildFieldUnitWorkloadRows(fieldUnits, operationalTasks, onSelectFieldUnit);

  return (
    <div>
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