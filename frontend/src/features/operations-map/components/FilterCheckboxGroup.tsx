import { formatEnumLabel } from "../../../shared/lib/formatLabel";
import "../styles/FilterCheckboxGroup.css";

interface FilterCheckboxGroupProps<T extends string> {
  label: string;
  options: T[];
  selectedOptions: T[];
  onToggle: (option: T) => void;
  variant?: "default" | "priority";
}

export function FilterCheckboxGroup<T extends string>({
  label,
  options,
  selectedOptions,
  onToggle,
  variant = "default",
}: FilterCheckboxGroupProps<T>) {
  return (
    <div className="filter-panel__group">
      <span className="filter-panel__group-label">{label}</span>
      <div className="filter-panel__chips">
        {options.map((option) => {
          const isSelected = selectedOptions.includes(option);
          const priorityModifier =
            variant === "priority" ? ` filter-chip--priority-${option.toLowerCase()}` : "";

          return (
            <label
              key={option}
              className={`filter-chip${isSelected ? " filter-chip--selected" : ""}${
                isSelected ? priorityModifier : ""
              }`}
            >
              <input
                type="checkbox"
                className="filter-chip__input"
                checked={isSelected}
                onChange={() => onToggle(option)}
              />
              {isSelected && <span className="filter-chip__dot" aria-hidden="true" />}
              {formatEnumLabel(option)}
            </label>
          );
        })}
      </div>
    </div>
  );
}