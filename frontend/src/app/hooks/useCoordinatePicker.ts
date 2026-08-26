import { useCallback, useState } from "react";

export interface PickedCoordinates {
  lat: number;
  lng: number;
}

export function useCoordinatePicker() {
  const [isPickingCoordinates, setIsPickingCoordinates] = useState(false);
  const [pickedCoordinates, setPickedCoordinates] = useState<PickedCoordinates | null>(null);

  const startPicking = useCallback(() => {
    setPickedCoordinates(null);
    setIsPickingCoordinates(true);
  }, []);

  const cancelPicking = useCallback(() => {
    setIsPickingCoordinates(false);
  }, []);

  const pickCoordinates = useCallback((lat: number, lng: number) => {
    setPickedCoordinates({ lat, lng });
    setIsPickingCoordinates(false);
  }, []);

  const consumePickedCoordinates = useCallback(() => {
    setPickedCoordinates(null);
  }, []);

  return {
    isPickingCoordinates,
    pickedCoordinates,
    startPicking,
    cancelPicking,
    pickCoordinates,
    consumePickedCoordinates,
  };
}
