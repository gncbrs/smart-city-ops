import type { Incident } from "../../incidents/types";
import type { FieldUnit } from "../../field-units/types";
import type { OperationalTask } from "../../operational-tasks/types";
import { buildCompletedHistoryRows } from "../../operational-tasks/lib/buildTaskRow";
import { HistoryTable } from "../../../shared/components/HistoryTable";

interface CompletedTasksSectionProps {
  incidents: Incident[];
  fieldUnits: FieldUnit[];
  operationalTasks: OperationalTask[];
  onSelectIncident: (incident: Incident) => void;
  onSelectFieldUnit: (fieldUnit: FieldUnit) => void;
}

export function CompletedTasksSection({
  incidents,
  fieldUnits,
  operationalTasks,
  onSelectIncident,
  onSelectFieldUnit,
}: CompletedTasksSectionProps) {
  const completedHistoryRows = buildCompletedHistoryRows(
    operationalTasks,
    fieldUnits,
    incidents,
    onSelectFieldUnit,
    onSelectIncident
  );

  return (
    <div>
      <h3>Task History ({completedHistoryRows.length})</h3>
      <HistoryTable
        columns={["Unit", "Incident", "Status", "Date/Time"]}
        rows={completedHistoryRows}
        emptyMessage="No completed or cancelled tasks yet."
      />
    </div>
  );
}
