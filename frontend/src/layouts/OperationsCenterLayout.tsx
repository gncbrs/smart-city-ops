import type { ReactNode } from "react";
import "./styles/OperationsCenterLayout.css";

interface OperationsCenterLayoutProps {
  map: ReactNode;
  sidePanel: ReactNode;
}

export function OperationsCenterLayout({ map, sidePanel }: OperationsCenterLayoutProps) {
  return (
    <div className="operations-center-layout">
      <div className="operations-center-layout__map">{map}</div>
      <div className="operations-center-layout__side-panel">{sidePanel}</div>
    </div>
  );
}
