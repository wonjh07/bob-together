'use client';

import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

import ReviewIcon from '@/components/icons/ReviewIcon';
import { KakaoMapPreview } from '@/components/kakao/KakaoMapPreview';
import IconLabel from '@/components/ui/IconLabel';
import InlineLoading from '@/components/ui/InlineLoading';
import ListStateView from '@/components/ui/ListStateView';
import PlaceRatingMeta from '@/components/ui/PlaceRatingMeta';
import PlainTopNav from '@/components/ui/PlainTopNav';
import { useInfiniteLoadMore } from '@/hooks/useInfiniteLoadMore';
import {
  createPlaceDetailQueryOptions,
  createPlaceReviewsQueryOptions,
  type PlaceReviewsPage,
} from '@/libs/query/placeQueries';
import { useQueryScope } from '@/provider/query-scope-provider';
import { extractDistrict } from '@/utils/address';

import PlaceReviewCard from './_components/PlaceReviewCard';
import * as styles from './page.css';

interface PlaceDetailClientProps {
  placeId: string;
}

export default function PlaceDetailClient({ placeId }: PlaceDetailClientProps) {
  const router = useRouter();
  const queryScope = useQueryScope();
  const detailQuery = useQuery(createPlaceDetailQueryOptions(placeId, queryScope));
  const reviewsQuery = useInfiniteQuery(
    createPlaceReviewsQueryOptions(placeId, queryScope),
  );

  const reviews =
    reviewsQuery.data?.pages.flatMap(
      (page: PlaceReviewsPage) => page.reviews,
    ) ?? [];
  const { hasMore, loadMoreRef } = useInfiniteLoadMore({
    fetchNextPage: reviewsQuery.fetchNextPage,
    hasNextPage: reviewsQuery.hasNextPage,
    isFetchingNextPage: reviewsQuery.isFetchingNextPage,
    isLoading: reviewsQuery.isLoading,
  });

  if (detailQuery.isLoading) {
    return (
      <div className={styles.page}>
        <PlainTopNav title="장소 정보" rightHidden onBack={() => router.back()} />
        <div className={styles.statusBox}>장소 정보를 불러오는 중...</div>
      </div>
    );
  }

  if (detailQuery.isError || !detailQuery.data) {
    return (
      <div className={styles.page}>
        <PlainTopNav title="장소 정보" rightHidden onBack={() => router.back()} />
        <div className={styles.statusBox}>
          {detailQuery.error instanceof Error
            ? detailQuery.error.message
            : '장소 정보를 불러오지 못했습니다.'}
        </div>
      </div>
    );
  }

  const place = detailQuery.data.place;
  const district = extractDistrict(place.address);
  const hasState =
    reviewsQuery.isLoading || reviewsQuery.isError || reviews.length === 0;

  return (
    <div className={styles.page}>
      <PlainTopNav title="장소 정보" rightHidden onBack={() => router.back()} />

      <div className={styles.content}>
        <section className={styles.summarySection}>
          <h1 className={styles.placeName}>{place.name}</h1>
          <PlaceRatingMeta
            rating={place.reviewAverage}
            reviewCount={place.reviewCount}
            district={district}
            category={place.category}
            as="p"
            rowClassName={styles.placeMeta}
            starClassName={styles.star}
          />
          <p className={styles.address}>{place.address}</p>
        </section>

        <div className={styles.mapWrapper}>
          <KakaoMapPreview
            latitude={place.latitude}
            longitude={place.longitude}
            title={place.name}
            address={place.address}
            isInteractive={false}
          />
        </div>
      </div>

      <section className={styles.reviewSection}>
        <IconLabel
          as="p"
          className={styles.reviewHeader}
          icon={<ReviewIcon className={styles.reviewIcon} />}>
          <span className={styles.reviewTitle}>리뷰 {place.reviewCount}</span>
        </IconLabel>

        {hasState ? (
          <ListStateView
            isLoading={reviewsQuery.isLoading}
            isError={reviewsQuery.isError}
            isEmpty={reviews.length === 0}
            error={reviewsQuery.error}
            loadingVariant="spinner"
            loadingText="리뷰를 불러오는 중..."
            emptyText="등록된 리뷰가 없습니다."
            defaultErrorText="리뷰를 불러오지 못했습니다."
            className={styles.statusBox}
          />
        ) : (
          <div className={styles.reviewList}>
            {reviews.map((review) => (
              <PlaceReviewCard key={review.reviewId} review={review} />
            ))}

            {reviewsQuery.isFetchingNextPage ? (
              <InlineLoading text="더 불러오는 중..." className={styles.statusInline} />
            ) : null}

            {hasMore && !reviewsQuery.isFetchingNextPage ? (
              <div ref={loadMoreRef} className={styles.loadMoreTrigger} />
            ) : null}
          </div>
        )}
      </section>
    </div>
  );
}
