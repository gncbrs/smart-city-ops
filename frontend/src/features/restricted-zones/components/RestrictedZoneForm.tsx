import type { RestrictedZoneType } from "../types";
import { formatEnumLabel } from "../../../shared/lib/formatLabel";
import { getErrorMessage } from "../../../shared/lib/getErrorMessage";
import { ZONE_TYPES } from "../constants";
import "../../../shared/styles/buttons.css";

interface RestrictedZoneFormProps {
  name: string;
  setName: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  zoneType: RestrictedZoneType;
  setZoneType: (value: RestrictedZoneType) => void;
  latitude: string;
  setLatitude: (value: string) => void;
  longitude: string;
  setLongitude: (value: string) => void;
  radiusMeters: string;
  setRadiusMeters: (value: string) => void;
  canSubmit: boolean;
  isCreating: boolean;
  isCreateError: boolean;
  createError: unknown;
  onCreate: () => void;
  isPickingCoordinates: boolean;
  onStartPickCoordinates: () => void;
  onCancelPickCoordinates: () => void;
}

export function RestrictedZoneForm({
  name,
  setName,
  description,
  setDescription,
  zoneType,
  setZoneType,
  latitude,
  setLatitude,
  longitude,
  setLongitude,
  radiusMeters,
  setRadiusMeters,
  canSubmit,
  isCreating,
  isCreateError,
  createError,
  onCreate,
  isPickingCoordinates,
  onStartPickCoordinates,
  onCancelPickCoordinates,
}: RestrictedZoneFormProps) {
  return (
    <>
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
        {isPickingCoordinates ? (
          <button
            type="button"
            className="app-button app-button--outlined"
            onClick={onCancelPickCoordinates}
          >
            Cancel Picking
          </button>
        ) : (
          <button
            type="button"
            className="app-button app-button--outlined"
            onClick={onStartPickCoordinates}
          >
            📍 Pick on Map
          </button>
        )}
        <input
          type="number"
          step="any"
          min="0"
          placeholder="Radius (meters)"
          value={radiusMeters}
          onChange={(event) => setRadiusMeters(event.target.value)}
        />
        <button type="button" onClick={onCreate} disabled={!canSubmit} className="app-button">
          {isCreating ? "Creating..." : "Create Restricted Zone"}
        </button>
      </div>

      {isCreateError && <p>{getErrorMessage(createError, "Failed to create restricted zone. Please try again.")}</p>}
    </>
  );
}
