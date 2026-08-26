import type { RestrictedZone } from "../types";
import { formatEnumLabel } from "../../../shared/lib/formatLabel";

interface RestrictedZoneRowProps {
  zone: RestrictedZone;
  isEditingDisabled: boolean;
  isDeleting: boolean;
  onEdit: (zone: RestrictedZone) => void;
  onDelete: (zone: RestrictedZone) => void;
}

export function RestrictedZoneRow({ zone, isEditingDisabled, isDeleting, onEdit, onDelete }: RestrictedZoneRowProps) {
  return (
    <tr>
      <td>{zone.name}</td>
      <td>{formatEnumLabel(zone.zoneType)}</td>
      <td>{`${zone.latitude.toFixed(4)}, ${zone.longitude.toFixed(4)}`}</td>
      <td>{`${zone.radiusMeters} m`}</td>
      <td>{zone.isActive ? "Active" : "Inactive"}</td>
      <td>
        <div className="restricted-zones-section__actions">
          <button
            type="button"
            className="restricted-zones-section__action-button"
            onClick={() => onEdit(zone)}
            disabled={isEditingDisabled || isDeleting}
          >
            Edit
          </button>
          <button
            type="button"
            className="restricted-zones-section__action-button restricted-zones-section__action-button--danger"
            onClick={() => onDelete(zone)}
            disabled={isEditingDisabled || isDeleting}
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
}
