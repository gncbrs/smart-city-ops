import { useEffect, useRef, useState } from "react";
import { Map as MapLibreMap } from "maplibre-gl";
import { ANKARA_CENTER, ANKARA_BOUNDS, MAP_STYLE_URL } from "../lib/mapConfig";

export function useMapInstance() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const [map, setMap] = useState<MapLibreMap | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const instance = new MapLibreMap({
      container: mapContainerRef.current,
      style: MAP_STYLE_URL,
      center: ANKARA_CENTER,
      zoom: 1,
      minZoom: 1,
      maxBounds: ANKARA_BOUNDS,
    });

    mapRef.current = instance;
    setMap(instance);

    const resizeObserver = new ResizeObserver(() => {
      instance.resize();
    });
    resizeObserver.observe(mapContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      instance.remove();
      mapRef.current = null;
      setMap(null);
    };
  }, []);

  return { mapContainerRef, map };
}