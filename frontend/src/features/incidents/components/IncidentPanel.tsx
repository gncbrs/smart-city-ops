import type { Incident } from "../types";
import type { FieldUnit } from "../../field-units/types";
import { useResolveIncident } from "../hooks/useResolveIncident";
import { formatEnumLabel } from "../../../shared/lib/formatLabel";
import { RecommendedUnitsSection } from "../../field-unit-recommendations/components/RecommendedUnitsSection";
import "../styles/IncidentPanel.css";
import "../../../shared/styles/buttons.css";

interface IncidentPanelProps {
  incident: Incident | null;
  fieldUnits: FieldUnit[];
  selectedFieldUnitId: string | null;
  onResolved: () => void;
  onViewTimeline: () => void;
  onSelectFieldUnit: (fieldUnit: FieldUnit) => void;
  onClose: () => void;
  readOnly?: boolean;
}

export function IncidentPanel({
  incident,
  fieldUnits,
  selectedFieldUnitId,
  onResolved,
  onViewTimeline,
  onSelectFieldUnit,
  onClose,
  readOnly = false,
}: IncidentPanelProps) {
  const { mutate, isPending, isError } = useResolveIncident();

  if (!incident) {
    return <p>Select an incident on the map to see details here.</p>;
  }

  const handleResolve = () => {
    mutate(incident.id, { onSuccess: onResolved });
  };

  return (
    <div className="incident-panel">
      <button
        type="button"
        className="incident-panel__close"
        onClick={onClose}
        aria-label="Deselect incident"
        title="Deselect incident"
      >
        ✕
      </button>
      <h3>{formatEnumLabel(incident.type)}</h3>
      <p>Priority: {incident.priority}</p>
      <p>Status: {formatEnumLabel(incident.status)}</p>
      <p>Description: {incident.description}</p>

      <div className="incident-panel__actions">
        <button type="button" onClick={onViewTimeline} className="app-button">
          View Timeline
        </button>
        {!readOnly && incident.status !== "Resolved" && (
          <button onClick={handleResolve} disabled={isPending} className="app-button">
            {isPending ? "Resolving..." : "Resolve Incident"}
          </button>
        )}
      </div>

      {!readOnly && isError && <p>Failed to resolve incident. Please try again.</p>}

      {readOnly && <p>Historical snapshot — actions disabled.</p>}

      {!readOnly && incident.status !== "Resolved" && (
        <RecommendedUnitsSection
          incidentId={incident.id}
          fieldUnits={fieldUnits}
          selectedFieldUnitId={selectedFieldUnitId}
          onSelectFieldUnit={onSelectFieldUnit}
        />
      )}
    </div>
  );
}