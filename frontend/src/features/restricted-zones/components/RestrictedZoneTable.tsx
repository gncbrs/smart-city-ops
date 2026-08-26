import type { RestrictedZone } from "../types";
import type { EditFormState } from "../hooks/useRestrictedZoneEdit";
import { RestrictedZoneRow } from "./RestrictedZoneRow";
import { RestrictedZoneEditRow } from "./RestrictedZoneEditRow";
import "../../../shared/styles/HistoryTable.css";

interface RestrictedZoneTableProps {
  zones: RestrictedZone[];
  editingId: string | null;
  editForm: EditFormState | null;
  onStartEdit: (zone: RestrictedZone) => void;
  onCancelEdit: () => void;
  onSaveEdit: (id: string) => void;
  onUpdateEditField: <K extends keyof EditFormState>(field: K, value: EditFormState[K]) => void;
  onDelete: (zone: RestrictedZone) => void;
  isUpdating: boolean;
  isUpdateError: boolean;
  updateError: unknown;
  isDeleting: boolean;
}

export function RestrictedZoneTable({
  zones,
  editingId,
  editForm,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onUpdateEditField,
  onDelete,
  isUpdating,
  isUpdateError,
  updateError,
  isDeleting,
}: RestrictedZoneTableProps) {
  if (zones.length === 0) {
    return <p>No restricted zones defined yet.</p>;
  }

  return (
    <div className="history-table__wrapper">
      <table className="history-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Center</th>
            <th>Radius</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {zones.map((zone) => {
            if (zone.id === editingId && editForm) {
              return (
                <RestrictedZoneEditRow
                  key={zone.id}
                  zone={zone}
                  editForm={editForm}
                  onUpdateField={onUpdateEditField}
                  onSave={onSaveEdit}
                  onCancel={onCancelEdit}
                  isUpdating={isUpdating}
                  isUpdateError={isUpdateError}
                  updateError={updateError}
                />
              );
            }

            return (
              <RestrictedZoneRow
                key={zone.id}
                zone={zone}
                isEditingDisabled={editingId !== null}
                isDeleting={isDeleting}
                onEdit={onStartEdit}
                onDelete={onDelete}
              />
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
