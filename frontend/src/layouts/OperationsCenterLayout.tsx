import type { ReactNode } from "react";
import "./styles/OperationsCenterLayout.css";

interface OperationsCenterLayoutProps {
  map: ReactNode;
  menu: ReactNode;
  sidePanel: ReactNode;
  fieldUnitPanel: ReactNode;
  incidentPanel: ReactNode;
  tasksPanel: ReactNode;
}

export function OperationsCenterLayout({
  map,
  menu,
  sidePanel,
  fieldUnitPanel,
  incidentPanel,
  tasksPanel,
}: OperationsCenterLayoutProps) {
  return (
    <div className="operations-center-layout">
      <div className="operations-center-layout__top">
        <div className="operations-center-layout__map">
          {map}
          {menu}
        </div>
        <div className="operations-center-layout__side-panel">{sidePanel}</div>
      </div>
      <div className="operations-center-layout__bottom-bar">
        <div className="operations-center-layout__bottom-bar-column">{fieldUnitPanel}</div>
        <div className="operations-center-layout__bottom-bar-column">{incidentPanel}</div>
        <div className="operations-center-layout__bottom-bar-column">{tasksPanel}</div>
      </div>
    </div>
  );
}