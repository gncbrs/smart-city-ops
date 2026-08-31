import type { OperationalStatistics } from "../types";
import { HistoryTable, type HistoryTableRow } from "../../../shared/components/HistoryTable";
import { formatEnumLabel } from "../../../shared/lib/formatLabel";
import { formatDuration } from "../../../shared/lib/formatDuration";
import "../styles/StatisticsSection.css";

interface StatisticsSectionProps {
  statistics: OperationalStatistics | undefined;
  onSelectFieldUnit: (id: string) => void;
}

function formatAverageResolutionMinutes(minutes: number | null): string {
  return minutes !== null ? formatDuration(minutes * 60000) : "N/A";
}

export function StatisticsSection({ statistics, onSelectFieldUnit }: StatisticsSectionProps) {
  if (!statistics) {
    return <p>Loading statistics...</p>;
  }

  const incidentsByTypeRows: HistoryTableRow[] = statistics.incidentsByType.map((entry) => ({
    id: entry.type,
    cells: [{ label: formatEnumLabel(entry.type) }, { label: String(entry.count) }],
  }));

  const fieldUnitWorkloadRows: HistoryTableRow[] = statistics.fieldUnitWorkload.map((entry) => ({
    id: entry.fieldUnitId,
    cells: [
      {
        label: `${formatEnumLabel(entry.unitType)} (${entry.unitCode})`,
        onClick: () => onSelectFieldUnit(entry.fieldUnitId),
      },
      { label: String(entry.completedTaskCount) },
    ],
  }));

  const overviewCards = [
    { label: "Active Incidents", value: statistics.activeIncidentsCount },
    { label: "High Priority Active Incidents", value: statistics.highPriorityActiveIncidentsCount, highlight: true },
    { label: "Available Field Units", value: statistics.availableFieldUnitsCount },
    { label: "Dispatched Field Units", value: statistics.dispatchedFieldUnitsCount },
    { label: "Out of Service Field Units", value: statistics.outOfServiceFieldUnitsCount },
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
      <p>{formatAverageResolutionMinutes(statistics.averageResolutionMinutes)}</p>

      <h3>Field Unit Workload</h3>
      <HistoryTable
        columns={["Unit", "Completed Tasks"]}
        rows={fieldUnitWorkloadRows}
        emptyMessage="No field units."
      />
    </div>
  );
}
