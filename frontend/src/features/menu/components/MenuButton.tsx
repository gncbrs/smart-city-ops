import "../styles/MenuButton.css";

interface MenuButtonProps {
  onClick: () => void;
}

export function MenuButton({ onClick }: MenuButtonProps) {
  return (
    <button type="button" className="menu-button" onClick={onClick}>
      Menu
    </button>
  );
}