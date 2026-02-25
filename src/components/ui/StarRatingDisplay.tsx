import StarIcon from '@/components/icons/StarIcon';

interface StarRatingDisplayProps {
  score: number;
  max?: number;
  rowClassName?: string;
  filledClassName?: string;
  emptyClassName?: string;
}

export default function StarRatingDisplay({
  score,
  max = 5,
  rowClassName,
  filledClassName,
  emptyClassName,
}: StarRatingDisplayProps) {
  return (
    <div className={rowClassName}>
      {Array.from({ length: max }).map((_, index) => {
        const isFilled = index < score;
        return (
          <StarIcon
            key={index}
            filled={isFilled}
            className={isFilled ? filledClassName : emptyClassName}
          />
        );
      })}
    </div>
  );
}
