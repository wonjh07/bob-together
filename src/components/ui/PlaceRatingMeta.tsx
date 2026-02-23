import * as styles from './PlaceRatingMeta.css';

function cx(...classNames: Array<string | undefined | false>) {
  return classNames.filter(Boolean).join(' ');
}

interface PlaceRatingMetaProps {
  rating: number | null;
  reviewCount: number;
  district?: string | null;
  category?: string | null;
  as?: 'div' | 'p';
  showReviewCountWhenZero?: boolean;
  rowClassName?: string;
  starClassName?: string;
  textClassName?: string;
}

export default function PlaceRatingMeta({
  rating,
  reviewCount,
  district,
  category,
  as = 'div',
  showReviewCountWhenZero = true,
  rowClassName,
  starClassName,
  textClassName,
}: PlaceRatingMetaProps) {
  const Component = as;
  const ratingText = rating !== null ? rating.toFixed(1) : '-';
  const shouldShowCount = showReviewCountWhenZero || reviewCount > 0;
  const extraTags = [district, category].filter(Boolean) as string[];

  return (
    <Component className={cx(styles.row, rowClassName)}>
      <span className={cx(styles.star, starClassName)}>★</span>
      <span className={cx(styles.text, textClassName)}>
        {ratingText}
        {shouldShowCount ? ` (${reviewCount})` : ''}
      </span>
      {extraTags.map((tag, index) => (
        <span key={`${tag}-${index}`} className={cx(styles.text, textClassName)}>
          · {tag}
        </span>
      ))}
    </Component>
  );
}
