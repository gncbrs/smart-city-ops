import type { RestrictedZone } from "../types";
import { useRestrictedZoneForm } from "../hooks/useRestrictedZoneForm";
import { useRestrictedZoneEdit } from "../hooks/useRestrictedZoneEdit";
import { useDeleteRestrictedZone } from "../hooks/useDeleteRestrictedZone";
import { RestrictedZoneTable } from "./RestrictedZoneTable";
import { RestrictedZoneForm } from "./RestrictedZoneForm";
import "../../../shared/styles/HistoryTable.css";
import "../styles/RestrictedZonesSection.css";
import "../../../shared/styles/buttons.css";

interface RestrictedZonesSectionProps {
  zones: RestrictedZone[];
  isPickingCoordinates: boolean;
  pickedCoordinates: { lat: number; lng: number } | null;
  onStartPickCoordinates: () => void;
  onCancelPickCoordinates: () => void;
  onCoordinatesApplied: () => void;
}

export function RestrictedZonesSection({
  zones,
  isPickingCoordinates,
  pickedCoordinates,
  onStartPickCoordinates,
  onCancelPickCoordinates,
  onCoordinatesApplied,
}: RestrictedZonesSectionProps) {
  const form = useRestrictedZoneForm(pickedCoordinates, onCoordinatesApplied);
  const edit = useRestrictedZoneEdit();
  const { mutate: deleteZone, isPending: isDeleting } = useDeleteRestrictedZone();

  const handleDelete = (zone: RestrictedZone) => {
    const confirmed = window.confirm(`Delete restricted zone "${zone.name}"? This cannot be undone.`);
    if (!confirmed) return;
    deleteZone(zone.id);
  };

  return (
    <div className="restricted-zones-section">
      <h3>Restricted Zones ({zones.length})</h3>

      <RestrictedZoneTable
        zones={zones}
        editingId={edit.editingId}
        editForm={edit.editForm}
        onStartEdit={edit.startEditing}
        onCancelEdit={edit.cancelEditing}
        onSaveEdit={edit.saveEditing}
        onUpdateEditField={edit.updateEditField}
        onDelete={handleDelete}
        isUpdating={edit.isUpdating}
        isUpdateError={edit.isUpdateError}
        updateError={edit.updateError}
        isDeleting={isDeleting}
      />

      <RestrictedZoneForm
        name={form.name}
        setName={form.setName}
        description={form.description}
        setDescription={form.setDescription}
        zoneType={form.zoneType}
        setZoneType={form.setZoneType}
        latitude={form.latitude}
        setLatitude={form.setLatitude}
        longitude={form.longitude}
        setLongitude={form.setLongitude}
        radiusMeters={form.radiusMeters}
        setRadiusMeters={form.setRadiusMeters}
        canSubmit={form.canSubmit}
        isCreating={form.isCreating}
        isCreateError={form.isCreateError}
        createError={form.createError}
        onCreate={form.handleCreate}
        isPickingCoordinates={isPickingCoordinates}
        onStartPickCoordinates={onStartPickCoordinates}
        onCancelPickCoordinates={onCancelPickCoordinates}
      />
    </div>
  );
}
