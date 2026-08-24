import type { FieldUnit } from "../../field-units/types";
import { useFieldUnitRecommendations } from "../hooks/useFieldUnitRecommendations";
import { formatEnumLabel } from "../../../shared/lib/formatLabel";
import "../styles/RecommendedUnitsSection.css";

const MAX_VISIBLE_RECOMMENDATIONS = 5;

interface RecommendedUnitsSectionProps {
  incidentId: string;
  fieldUnits: FieldUnit[];
  selectedFieldUnitId: string | null;
  onSelectFieldUnit: (fieldUnit: FieldUnit) => void;
}

export function RecommendedUnitsSection({
  incidentId,
  fieldUnits,
  selectedFieldUnitId,
  onSelectFieldUnit,
}: RecommendedUnitsSectionProps) {
  const { data: recommendations, isLoading, isError } = useFieldUnitRecommendations(incidentId);

  const handleSelect = (fieldUnitId: string) => {
    const fieldUnit = fieldUnits.find((unit) => unit.id === fieldUnitId);
    if (fieldUnit) {
      onSelectFieldUnit(fieldUnit);
    }
  };

  return (
    <div className="recommended-units-section">
      <h4 className="recommended-units-section__title">Recommended Units</h4>

      {isLoading && <p>Loading recommendations...</p>}
      {isError && <p>Failed to load recommendations. Please try again.</p>}
      {!isLoading && !isError && recommendations && recommendations.length === 0 && (
        <p>No field units available.</p>
      )}

      <ul className="recommended-units-section__list">
        {recommendations?.slice(0, MAX_VISIBLE_RECOMMENDATIONS).map((recommendation) => (
          <li key={recommendation.fieldUnitId}>
            <button
              type="button"
              onClick={() => handleSelect(recommendation.fieldUnitId)}
              className={
                "recommended-units-section__card" +
                (recommendation.fieldUnitId === selectedFieldUnitId
                  ? " recommended-units-section__card--selected"
                  : "")
              }
            >
              <div className="recommended-units-section__card-header">
                <span className="recommended-units-section__unit-name">
                  {formatEnumLabel(recommendation.unitType)} ({recommendation.unitCode})
                </span>
                <span className="recommended-units-section__score-badge">
                  {Math.round(recommendation.totalScore)}%
                </span>
              </div>

              <div className="recommended-units-section__metrics">
                <span>{formatEnumLabel(recommendation.status)}</span>
                <span>{recommendation.distanceKm.toFixed(1)} km</span>
                <span>ETA {recommendation.estimatedEtaMinutes} min</span>
              </div>

              {recommendation.matchReasons.length > 0 && (
                <div className="recommended-units-section__reasons">
                  {recommendation.matchReasons.map((reason) => (
                    <span key={reason} className="recommended-units-section__reason-pill">
                      {reason}
                    </span>
                  ))}
                </div>
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
