import { useState } from "react";
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
  // Below the tablet breakpoint the side panel and bottom bar become off-canvas
  // drawers over a full-screen map (see the max-width: 768px rules in
  // OperationsCenterLayout.css); above it these two flags are visually inert
  // because CSS keeps both panels docked open regardless of class state.
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [isBottomBarOpen, setIsBottomBarOpen] = useState(false);

  const closeDrawers = () => {
    setIsSidePanelOpen(false);
    setIsBottomBarOpen(false);
  };

  return (
    <div className="operations-center-layout">
      <div className="operations-center-layout__top">
        <div className="operations-center-layout__map">
          {map}
          {menu}

          <button
            type="button"
            className="operations-center-layout__panel-toggle operations-center-layout__panel-toggle--filters"
            onClick={() => setIsSidePanelOpen(true)}
          >
            Filters &amp; Stats
          </button>

          <button
            type="button"
            className="operations-center-layout__panel-toggle operations-center-layout__panel-toggle--units"
            onClick={() => setIsBottomBarOpen(true)}
          >
            Units &amp; Tasks
          </button>
        </div>

        <div
          className={
            "operations-center-layout__side-panel" +
            (isSidePanelOpen ? " operations-center-layout__side-panel--open" : "")
          }
        >
          <button
            type="button"
            className="operations-center-layout__panel-close"
            onClick={() => setIsSidePanelOpen(false)}
          >
            Close
          </button>
          {sidePanel}
        </div>
      </div>

      <div
        className={
          "operations-center-layout__bottom-bar" +
          (isBottomBarOpen ? " operations-center-layout__bottom-bar--open" : "")
        }
      >
        <button
          type="button"
          className="operations-center-layout__panel-close"
          onClick={() => setIsBottomBarOpen(false)}
        >
          Close
        </button>
        <div className="operations-center-layout__bottom-bar-column">{fieldUnitPanel}</div>
        <div className="operations-center-layout__bottom-bar-column">{incidentPanel}</div>
        <div className="operations-center-layout__bottom-bar-column">{tasksPanel}</div>
      </div>

      {(isSidePanelOpen || isBottomBarOpen) && (
        <div className="operations-center-layout__backdrop" onClick={closeDrawers} />
      )}
    </div>
  );
}