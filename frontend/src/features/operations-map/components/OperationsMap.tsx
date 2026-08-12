import { useEffect, useRef } from "react";
import { Map as MapLibreMap } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

const ANKARA_CENTER: [number, number] = [32.836, 39.925];

export function OperationsMap() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    mapRef.current = new MapLibreMap({
      container: mapContainerRef.current,
      style: "https://demotiles.maplibre.org/style.json",
      center: ANKARA_CENTER,
      zoom: 12,
    });

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  return <div ref={mapContainerRef} style={{ width: "100%", height: "100%" }} />;
}
