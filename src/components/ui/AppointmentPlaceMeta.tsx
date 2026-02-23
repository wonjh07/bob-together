import PlaceRatingMeta from './PlaceRatingMeta';

interface AppointmentPlaceMetaProps {
  title?: string;
  titleAs?: 'h1' | 'h2' | 'p';
  titleClassName?: string;
  placeName: string;
  placeNameAs?: 'h2' | 'p';
  placeNameClassName?: string;
  rating: number | null;
  reviewCount: number;
  district?: string | null;
  category?: string | null;
  wrapperClassName?: string;
  metaClassName?: string;
  starClassName?: string;
  showReviewCountWhenZero?: boolean;
}

export default function AppointmentPlaceMeta({
  title,
  titleAs = 'h2',
  titleClassName,
  placeName,
  placeNameAs = 'h2',
  placeNameClassName,
  rating,
  reviewCount,
  district,
  category,
  wrapperClassName,
  metaClassName,
  starClassName,
  showReviewCountWhenZero = true,
}: AppointmentPlaceMetaProps) {
  const TitleTag = titleAs;
  const PlaceTag = placeNameAs;

  const content = (
    <>
      {title ? <TitleTag className={titleClassName}>{title}</TitleTag> : null}
      <PlaceTag className={placeNameClassName}>{placeName}</PlaceTag>
      <PlaceRatingMeta
        rating={rating}
        reviewCount={reviewCount}
        district={district}
        category={category}
        as="p"
        rowClassName={metaClassName}
        starClassName={starClassName}
        showReviewCountWhenZero={showReviewCountWhenZero}
      />
    </>
  );

  if (wrapperClassName) {
    return <div className={wrapperClassName}>{content}</div>;
  }

  return content;
}
