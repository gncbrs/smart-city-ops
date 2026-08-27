import type { Incident } from "../../incidents/types";
import type { FieldUnit } from "../../field-units/types";
import type { OperationalTask } from "../../operational-tasks/types";
import {
  buildIncidentsByTypeRows,
  computeAverageResolutionMs,
  buildFieldUnitWorkloadRows,
} from "../lib/buildOperationalStatistics";
import { HistoryTable } from "../../../shared/components/HistoryTable";
import { formatDuration } from "../../../shared/lib/formatDuration";
import "../styles/StatisticsSection.css";

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
  const incidentsByTypeRows = buildIncidentsByTypeRows(incidents);
  const averageResolutionMs = computeAverageResolutionMs(incidents);
  const fieldUnitWorkloadRows = buildFieldUnitWorkloadRows(fieldUnits, operationalTasks, onSelectFieldUnit);

  const activeIncidentsCount = incidents.filter((incident) => incident.status !== "Resolved").length;
  const highPriorityActiveCount = incidents.filter(
    (incident) => incident.priority === "High" && incident.status !== "Resolved"
  ).length;
  const availableFieldUnitsCount = fieldUnits.filter((unit) => unit.status === "Available").length;
  const dispatchedFieldUnitsCount = fieldUnits.filter((unit) => unit.status === "Dispatched").length;
  const outOfServiceFieldUnitsCount = fieldUnits.filter((unit) => unit.status === "OutOfService").length;

  const overviewCards = [
    { label: "Active Incidents", value: activeIncidentsCount },
    { label: "High Priority Active Incidents", value: highPriorityActiveCount, highlight: true },
    { label: "Available Field Units", value: availableFieldUnitsCount },
    { label: "Dispatched Field Units", value: dispatchedFieldUnitsCount },
    { label: "Out of Service Field Units", value: outOfServiceFieldUnitsCount },
  ];

  return (
    <div>
      <h3>Operational Overview</h3>
      <div className="statistics-section__overview">
        {overviewCards.map((card) => (
          <div
            key={card.label}
            className={
              card.highlight
                ? "statistics-section__card statistics-section__card--highlight"
                : "statistics-section__card"
            }
          >
            <p className="statistics-section__card-label">{card.label}</p>
            <p className="statistics-section__card-value">{card.value}</p>
          </div>
        ))}
      </div>

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