import { useState } from "react";
import type { RestrictedZone, RestrictedZoneType, UpdateRestrictedZoneDto } from "../types";
import { useCreateRestrictedZone } from "../hooks/useCreateRestrictedZone";
import { useUpdateRestrictedZone } from "../hooks/useUpdateRestrictedZone";
import { useDeleteRestrictedZone } from "../hooks/useDeleteRestrictedZone";
import { formatEnumLabel } from "../../../shared/lib/formatLabel";
import { getErrorMessage } from "../../../shared/lib/getErrorMessage";
import "../../../shared/styles/HistoryTable.css";
import "../styles/RestrictedZonesSection.css";
import "../../../shared/styles/buttons.css";

const ZONE_TYPES: RestrictedZoneType[] = ["Hazard", "SecurityLockdown", "RoadConstruction"];

interface RestrictedZonesSectionProps {
  zones: RestrictedZone[];
}

interface EditFormState {
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

export function RestrictedZonesSection({ zones }: RestrictedZonesSectionProps) {
  const { mutate: createZone, isPending: isCreating, isError: isCreateError, error: createError } =
    useCreateRestrictedZone();
  const { mutate: updateZone, isPending: isUpdating, isError: isUpdateError, error: updateError } =
    useUpdateRestrictedZone();
  const { mutate: deleteZone, isPending: isDeleting } = useDeleteRestrictedZone();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [zoneType, setZoneType] = useState<RestrictedZoneType>("Hazard");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [radiusMeters, setRadiusMeters] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditFormState | null>(null);

  const canSubmit =
    name.trim() !== "" && latitude !== "" && longitude !== "" && radiusMeters !== "" && !isCreating;

  const handleCreate = () => {
    if (!canSubmit) return;

    createZone(
      {
        name: name.trim(),
        description: description.trim(),
        zoneType,
        latitude: Number(latitude),
        longitude: Number(longitude),
        radiusMeters: Number(radiusMeters),
      },
      {
        onSuccess: () => {
          setName("");
          setDescription("");
          setLatitude("");
          setLongitude("");
          setRadiusMeters("");
        },
      }
    );
  };

  const handleStartEdit = (zone: RestrictedZone) => {
    setEditingId(zone.id);
    setEditForm(toEditFormState(zone));
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const handleSaveEdit = (id: string) => {
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
        onSuccess: () => {
          setEditingId(null);
          setEditForm(null);
        },
      }
    );
  };

  const handleDelete = (zone: RestrictedZone) => {
    const confirmed = window.confirm(`Delete restricted zone "${zone.name}"? This cannot be undone.`);
    if (!confirmed) return;
    deleteZone(zone.id);
  };

  return (
    <div className="restricted-zones-section">
      <h3>Restricted Zones ({zones.length})</h3>

      {zones.length === 0 ? (
        <p>No restricted zones defined yet.</p>
      ) : (
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
                const isEditingRow = editingId === zone.id;

                if (isEditingRow && editForm) {
                  return (
                    <tr key={zone.id} className="restricted-zones-section__edit-row">
                      <td>
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(event) => setEditForm({ ...editForm, name: event.target.value })}
                        />
                      </td>
                      <td>
                        <select
                          value={editForm.zoneType}
                          onChange={(event) =>
                            setEditForm({ ...editForm, zoneType: event.target.value as RestrictedZoneType })
                          }
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
                            onChange={(event) => setEditForm({ ...editForm, latitude: event.target.value })}
                          />
                          <input
                            type="number"
                            step="any"
                            placeholder="Longitude"
                            value={editForm.longitude}
                            onChange={(event) => setEditForm({ ...editForm, longitude: event.target.value })}
                          />
                        </div>
                      </td>
                      <td>
                        <input
                          type="number"
                          step="any"
                          min="0"
                          value={editForm.radiusMeters}
                          onChange={(event) => setEditForm({ ...editForm, radiusMeters: event.target.value })}
                        />
                      </td>
                      <td>
                        <select
                          value={editForm.isActive ? "active" : "inactive"}
                          onChange={(event) =>
                            setEditForm({ ...editForm, isActive: event.target.value === "active" })
                          }
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
                            onClick={() => handleSaveEdit(zone.id)}
                            disabled={isUpdating}
                          >
                            {isUpdating ? "Saving..." : "Save"}
                          </button>
                          <button
                            type="button"
                            className="restricted-zones-section__action-button restricted-zones-section__action-button--secondary"
                            onClick={handleCancelEdit}
                            disabled={isUpdating}
                          >
                            Cancel
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr key={zone.id}>
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
                          onClick={() => handleStartEdit(zone)}
                          disabled={editingId !== null || isDeleting}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="restricted-zones-section__action-button restricted-zones-section__action-button--danger"
                          onClick={() => handleDelete(zone)}
                          disabled={editingId !== null || isDeleting}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {isUpdateError && <p>{getErrorMessage(updateError, "Failed to update restricted zone. Please try again.")}</p>}

      <h4>Define New Restricted Zone</h4>
      <div className="restricted-zones-section__form">
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
        <select value={zoneType} onChange={(event) => setZoneType(event.target.value as RestrictedZoneType)}>
          {ZONE_TYPES.map((type) => (
            <option key={type} value={type}>
              {formatEnumLabel(type)}
            </option>
          ))}
        </select>
        <input
          type="number"
          step="any"
          placeholder="Latitude"
          value={latitude}
          onChange={(event) => setLatitude(event.target.value)}
        />
        <input
          type="number"
          step="any"
          placeholder="Longitude"
          value={longitude}
          onChange={(event) => setLongitude(event.target.value)}
        />
        <input
          type="number"
          step="any"
          min="0"
          placeholder="Radius (meters)"
          value={radiusMeters}
          onChange={(event) => setRadiusMeters(event.target.value)}
        />
        <button type="button" onClick={handleCreate} disabled={!canSubmit} className="app-button">
          {isCreating ? "Creating..." : "Create Restricted Zone"}
        </button>
      </div>

      {isCreateError && <p>{getErrorMessage(createError, "Failed to create restricted zone. Please try again.")}</p>}
    </div>
  );
}
