import * as styles from './ChipToggleGroup.css';

interface ChipToggleOption<T extends string> {
  value: T;
  label: string;
}

interface ChipToggleGroupProps<T extends string> {
  options: Array<ChipToggleOption<T>>;
  value: T;
  onChange: (value: T) => void;
  disabled?: boolean;
  layout?: 'wrap' | 'scroll';
}

export default function ChipToggleGroup<T extends string>({
  options,
  value,
  onChange,
  disabled = false,
  layout = 'wrap',
}: ChipToggleGroupProps<T>) {
  return (
    <div className={styles.container[layout]}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={styles.button[value === option.value ? 'active' : 'inactive']}
          onClick={() => onChange(option.value)}
          disabled={disabled}>
          {option.label}
        </button>
      ))}
    </div>
  );
}
