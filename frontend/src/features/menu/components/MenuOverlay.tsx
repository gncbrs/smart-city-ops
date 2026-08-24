import type { ReactNode } from "react";
import "../styles/MenuOverlay.css";
import "../../../shared/styles/buttons.css";

interface MenuOverlayProps {
  isOpen: boolean;
  showBackButton: boolean;
  onBack: () => void;
  onClose: () => void;
  children: ReactNode;
}

export function MenuOverlay({ isOpen, showBackButton, onBack, onClose, children }: MenuOverlayProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="menu-overlay">
      <div className="menu-overlay__content">
        {showBackButton && (
          <button type="button" className="app-button" onClick={onBack}>
            ← Back to Menu
          </button>
        )}

        {children}
        <br/>

        <button type="button" className="app-button" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}