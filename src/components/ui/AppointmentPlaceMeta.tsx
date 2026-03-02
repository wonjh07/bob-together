import Link from 'next/link';

import * as styles from './AppointmentPlaceMeta.css';
import PlaceRatingMeta from './PlaceRatingMeta';

interface AppointmentPlaceMetaProps {
  title?: string;
  placeName: string;
  placeHref?: string;
  rating: number | null;
  reviewCount: number;
  category?: string | null;
  showReviewCountWhenZero?: boolean;
}

export default function AppointmentPlaceMeta({
  title,
  placeName,
  placeHref,
  rating,
  reviewCount,
  category,
  showReviewCountWhenZero = true,
}: AppointmentPlaceMetaProps) {
  return (
    <div className={styles.wrapper}>
      {title ? <h2 className={styles.title}>{title}</h2> : null}
      <p className={styles.placeName}>
        {placeHref ? (
          <Link href={placeHref} className={styles.placeLink}>
            {placeName}
          </Link>
        ) : (
          placeName
        )}
      </p>
      <PlaceRatingMeta
        rating={rating}
        reviewCount={reviewCount}
        category={category}
        as="p"
        rowClassName={styles.meta}
        showReviewCountWhenZero={showReviewCountWhenZero}
      />
    </div>
  );
}
