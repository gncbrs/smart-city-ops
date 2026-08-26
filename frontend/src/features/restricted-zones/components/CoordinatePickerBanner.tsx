import "../styles/CoordinatePickerBanner.css";
import "../../../shared/styles/buttons.css";

interface CoordinatePickerBannerProps {
  onCancel: () => void;
}

export function CoordinatePickerBanner({ onCancel }: CoordinatePickerBannerProps) {
  return (
    <div className="coordinate-picker-banner">
      <span>Click on the map to set the restricted zone center.</span>
      <button type="button" className="app-button" onClick={onCancel}>
        Cancel
      </button>
    </div>
  );
}
