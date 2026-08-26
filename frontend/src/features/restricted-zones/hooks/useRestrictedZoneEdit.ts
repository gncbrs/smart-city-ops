import { useState } from "react";
import type { RestrictedZone, RestrictedZoneType, UpdateRestrictedZoneDto } from "../types";
import { useUpdateRestrictedZone } from "./useUpdateRestrictedZone";

export interface EditFormState {
  name: string;
  description: string;
  zoneType: RestrictedZoneType;
  latitude: string;
  longitude: string;
  radiusMeters: string;
  isActive: boolean;
}

function toEditFormState(zone: RestrictedZone): EditFormState {
  return {
    name: zone.name,
    description: zone.description,
    zoneType: zone.zoneType,
    latitude: String(zone.latitude),
    longitude: String(zone.longitude),
    radiusMeters: String(zone.radiusMeters),
    isActive: zone.isActive,
  };
}

export function useRestrictedZoneEdit() {
  const { mutate: updateZone, isPending: isUpdating, isError: isUpdateError, error: updateError } =
    useUpdateRestrictedZone();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditFormState | null>(null);

  const startEditing = (zone: RestrictedZone) => {
    setEditingId(zone.id);
    setEditForm(toEditFormState(zone));
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const updateEditField = <K extends keyof EditFormState>(field: K, value: EditFormState[K]) => {
    setEditForm((current) => (current ? { ...current, [field]: value } : current));
  };

  const saveEditing = (id: string) => {
    if (!editForm) return;
    if (editForm.name.trim() === "" || editForm.latitude === "" || editForm.longitude === "" || editForm.radiusMeters === "") {
      return;
    }

    const dto: UpdateRestrictedZoneDto = {
      name: editForm.name.trim(),
      description: editForm.description.trim(),
      zoneType: editForm.zoneType,
      latitude: Number(editForm.latitude),
      longitude: Number(editForm.longitude),
      radiusMeters: Number(editForm.radiusMeters),
      isActive: editForm.isActive,
    };

    updateZone(
      { id, dto },
      {
        onSuccess: cancelEditing,
      }
    );
  };

  return {
    editingId,
    editForm,
    startEditing,
    cancelEditing,
    updateEditField,
    saveEditing,
    isUpdating,
    isUpdateError,
    updateError,
  };
}
