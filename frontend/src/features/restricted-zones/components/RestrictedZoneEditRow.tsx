import type { RestrictedZone, RestrictedZoneType } from "../types";
import type { EditFormState } from "../hooks/useRestrictedZoneEdit";
import { formatEnumLabel } from "../../../shared/lib/formatLabel";
import { getErrorMessage } from "../../../shared/lib/getErrorMessage";
import { ZONE_TYPES } from "../constants";

interface RestrictedZoneEditRowProps {
  zone: RestrictedZone;
  editForm: EditFormState;
  onUpdateField: <K extends keyof EditFormState>(field: K, value: EditFormState[K]) => void;
  onSave: (id: string) => void;
  onCancel: () => void;
  isUpdating: boolean;
  isUpdateError: boolean;
  updateError: unknown;
}

export function RestrictedZoneEditRow({
  zone,
  editForm,
  onUpdateField,
  onSave,
  onCancel,
  isUpdating,
  isUpdateError,
  updateError,
}: RestrictedZoneEditRowProps) {
  return (
    <tr className="restricted-zones-section__edit-row">
      <td>
        <input
          type="text"
          value={editForm.name}
          onChange={(event) => onUpdateField("name", event.target.value)}
        />
      </td>
      <td>
        <select
          value={editForm.zoneType}
          onChange={(event) => onUpdateField("zoneType", event.target.value as RestrictedZoneType)}
        >
          {ZONE_TYPES.map((type) => (
            <option key={type} value={type}>
              {formatEnumLabel(type)}
            </option>
          ))}
        </select>
      </td>
      <td>
        <div className="restricted-zones-section__edit-coords">
          <input
            type="number"
            step="any"
            placeholder="Latitude"
            value={editForm.latitude}
            onChange={(event) => onUpdateField("latitude", event.target.value)}
          />
          <input
            type="number"
            step="any"
            placeholder="Longitude"
            value={editForm.longitude}
            onChange={(event) => onUpdateField("longitude", event.target.value)}
          />
        </div>
      </td>
      <td>
        <input
          type="number"
          step="any"
          min="0"
          value={editForm.radiusMeters}
          onChange={(event) => onUpdateField("radiusMeters", event.target.value)}
        />
      </td>
      <td>
        <select
          value={editForm.isActive ? "active" : "inactive"}
          onChange={(event) => onUpdateField("isActive", event.target.value === "active")}
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </td>
      <td>
        <div className="restricted-zones-section__actions">
          <button
            type="button"
            className="restricted-zones-section__action-button"
            onClick={() => onSave(zone.id)}
            disabled={isUpdating}
          >
            {isUpdating ? "Saving..." : "Save"}
          </button>
          <button
            type="button"
            className="restricted-zones-section__action-button restricted-zones-section__action-button--secondary"
            onClick={onCancel}
            disabled={isUpdating}
          >
            Cancel
          </button>
        </div>
        {isUpdateError && <p>{getErrorMessage(updateError, "Failed to update restricted zone. Please try again.")}</p>}
      </td>
    </tr>
  );
}
