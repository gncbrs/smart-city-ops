import type { ReactNode } from "react";
import { OperationsMap } from "../features/operations-map/components/OperationsMap";

interface OperationsCenterLayoutProps {
  sidePanel: ReactNode;
}

export function OperationsCenterLayout({ sidePanel }: OperationsCenterLayoutProps) {
  return (
    <div style={{ display: "flex", width: "100vw", height: "100vh" }}>
      <div style={{ flex: 1 }}>
        <OperationsMap />
      </div>
      <div style={{ width: 360, borderLeft: "1px solid #ddd", padding: 16, overflowY: "auto" }}>
        {sidePanel}
      </div>
    </div>
  );
}
