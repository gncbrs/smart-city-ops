import { formatEnumLabel } from "../../../shared/lib/formatLabel";
import "../styles/FilterCheckboxGroup.css";

interface FilterCheckboxGroupProps<T extends string> {
  label: string;
  options: T[];
  selectedOptions: T[];
  onToggle: (option: T) => void;
}

export function FilterCheckboxGroup<T extends string>({
  label,
  options,
  selectedOptions,
  onToggle,
}: FilterCheckboxGroupProps<T>) {
  return (
    <div className="filter-panel__group">
      <span className="filter-panel__group-label">{label}</span>
      {options.map((option) => (
        <label key={option} className="filter-panel__option">
          <input
            type="checkbox"
            checked={selectedOptions.includes(option)}
            onChange={() => onToggle(option)}
          />
          {formatEnumLabel(option)}
        </label>
      ))}
    </div>
  );
}