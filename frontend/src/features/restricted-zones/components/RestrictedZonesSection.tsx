import { useState } from "react";
import type { RestrictedZone, RestrictedZoneType } from "../types";
import { useCreateRestrictedZone } from "../hooks/useCreateRestrictedZone";
import { formatEnumLabel } from "../../../shared/lib/formatLabel";
import { getErrorMessage } from "../../../shared/lib/getErrorMessage";
import { HistoryTable, type HistoryTableRow } from "../../../shared/components/HistoryTable";
import "../styles/RestrictedZonesSection.css";
import "../../../shared/styles/buttons.css";

const ZONE_TYPES: RestrictedZoneType[] = ["Hazard", "SecurityLockdown", "RoadConstruction"];

interface RestrictedZonesSectionProps {
  zones: RestrictedZone[];
}

export function RestrictedZonesSection({ zones }: RestrictedZonesSectionProps) {
  const { mutate, isPending, isError, error } = useCreateRestrictedZone();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [zoneType, setZoneType] = useState<RestrictedZoneType>("Hazard");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [radiusMeters, setRadiusMeters] = useState("");

  const rows: HistoryTableRow[] = zones.map((zone) => ({
    id: zone.id,
    cells: [
      { label: zone.name },
      { label: formatEnumLabel(zone.zoneType) },
      { label: `${zone.latitude.toFixed(4)}, ${zone.longitude.toFixed(4)}` },
      { label: `${zone.radiusMeters} m` },
      { label: zone.isActive ? "Active" : "Inactive" },
    ],
  }));

  const canSubmit =
    name.trim() !== "" && latitude !== "" && longitude !== "" && radiusMeters !== "" && !isPending;

  const handleCreate = () => {
    if (!canSubmit) return;

    mutate(
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

  return (
    <div className="restricted-zones-section">
      <h3>Restricted Zones ({zones.length})</h3>
      <HistoryTable
        columns={["Name", "Type", "Center", "Radius", "Status"]}
        rows={rows}
        emptyMessage="No restricted zones defined yet."
      />

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
          {isPending ? "Creating..." : "Create Restricted Zone"}
        </button>
      </div>

      {isError && <p>{getErrorMessage(error, "Failed to create restricted zone. Please try again.")}</p>}
    </div>
  );
}
