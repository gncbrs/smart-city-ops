import { useEffect, useState } from "react";
import type { RestrictedZoneType } from "../types";
import { useCreateRestrictedZone } from "./useCreateRestrictedZone";

export function useRestrictedZoneForm(
  pickedCoordinates: { lat: number; lng: number } | null,
  onCoordinatesApplied: () => void
) {
  const { mutate: createZone, isPending: isCreating, isError: isCreateError, error: createError } =
    useCreateRestrictedZone();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [zoneType, setZoneType] = useState<RestrictedZoneType>("Hazard");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [radiusMeters, setRadiusMeters] = useState("");

  useEffect(() => {
    if (!pickedCoordinates) return;
    setLatitude(pickedCoordinates.lat.toFixed(5));
    setLongitude(pickedCoordinates.lng.toFixed(5));
    onCoordinatesApplied();
  }, [pickedCoordinates, onCoordinatesApplied]);

  const canSubmit =
    name.trim() !== "" && latitude !== "" && longitude !== "" && radiusMeters !== "" && !isCreating;

  const resetForm = () => {
    setName("");
    setDescription("");
    setLatitude("");
    setLongitude("");
    setRadiusMeters("");
  };

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
        onSuccess: resetForm,
      }
    );
  };

  return {
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
    resetForm,
    handleCreate,
    isCreating,
    isCreateError,
    createError,
  };
}
