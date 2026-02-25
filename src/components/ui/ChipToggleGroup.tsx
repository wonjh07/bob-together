import * as chipStyles from '@/styles/primitives/chip.css';

interface ChipToggleOption<T extends string> {
  value: T;
  label: string;
}

interface ChipToggleGroupProps<T extends string> {
  options: Array<ChipToggleOption<T>>;
  value: T;
  onChange: (value: T) => void;
  disabled?: boolean;
  containerClassName?: string;
  buttonClassName?: string;
  activeButtonClassName?: string;
}

function cx(...classNames: Array<string | undefined>) {
  return classNames.filter(Boolean).join(' ');
}

export default function ChipToggleGroup<T extends string>({
  options,
  value,
  onChange,
  disabled = false,
  containerClassName,
  buttonClassName,
  activeButtonClassName,
}: ChipToggleGroupProps<T>) {
  return (
    <div className={cx(chipStyles.chipContainer, containerClassName)}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={cx(
            chipStyles.chipButton,
            buttonClassName,
            value === option.value ? chipStyles.chipButtonActive : undefined,
            value === option.value ? activeButtonClassName : undefined,
          )}
          onClick={() => onChange(option.value)}
          disabled={disabled}>
          {option.label}
        </button>
      ))}
    </div>
  );
}
