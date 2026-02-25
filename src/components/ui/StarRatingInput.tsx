import StarIcon from '@/components/icons/StarIcon';

interface StarRatingInputProps {
  value: number;
  onChange: (next: number) => void;
  max?: number;
  disabled?: boolean;
  rowClassName?: string;
  buttonClassName?: string;
  activeButtonClassName?: string;
  ariaLabelSuffix?: string;
}

export default function StarRatingInput({
  value,
  onChange,
  max = 5,
  disabled = false,
  rowClassName,
  buttonClassName,
  activeButtonClassName,
  ariaLabelSuffix = '점',
}: StarRatingInputProps) {
  return (
    <div className={rowClassName}>
      {Array.from({ length: max }).map((_, index) => {
        const nextScore = index + 1;
        const isActive = nextScore <= value;
        return (
          <button
            key={nextScore}
            type="button"
            className={isActive ? activeButtonClassName : buttonClassName}
            onClick={() => onChange(nextScore)}
            aria-label={`${nextScore}${ariaLabelSuffix}`}
            disabled={disabled}>
            <StarIcon filled={isActive} />
          </button>
        );
      })}
    </div>
  );
}
