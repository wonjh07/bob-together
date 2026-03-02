'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useEffect, useRef } from 'react';

import DateTimeMetaRow from '@/components/ui/DateTimeMetaRow';
import PlaceRatingMeta from '@/components/ui/PlaceRatingMeta';
import { useHorizontalInfiniteObserver } from '@/hooks/useHorizontalInfiniteObserver';
import { useHorizontalWheelScroll } from '@/hooks/useHorizontalWheelScroll';
import { useRequestErrorPresenter } from '@/hooks/useRequestErrorPresenter';
import {
  createReviewableAppointmentsQueryOptions,
  type ReviewableAppointmentsPage,
} from '@/libs/query/appointmentQueries';
import { useQueryScope } from '@/provider/query-scope-provider';

import * as styles from './ReviewsWaitList.css';

export function ReviewsWaitList() {
  const queryScope = useQueryScope();
  const queryOptions = createReviewableAppointmentsQueryOptions(queryScope);
  const { syncRequestError } = useRequestErrorPresenter({
    source: 'ReviewsWaitList.query.error',
    fallbackMessage: '작성 가능한 리뷰를 불러오지 못했습니다.',
  });
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery({
    ...queryOptions,
  });

  const items =
    data?.pages.flatMap(
      (page: ReviewableAppointmentsPage) => page.appointments,
    ) ?? [];

  useEffect(() => {
    syncRequestError({ isError, err: error });
  }, [error, isError, syncRequestError]);

  useHorizontalInfiniteObserver({
    rootRef: scrollContainerRef,
    targetRef: sentinelRef,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    observeKey: items.length,
  });

  useHorizontalWheelScroll({
    containerRef: scrollContainerRef,
  });

  if (isLoading) {
    return (
      <section className={styles.container}>
        <div className={styles.emptyState}>
          작성 가능한 리뷰를 불러오는 중...
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <section className={styles.container}>
        <div className={styles.emptyState}>
          작성 가능한 리뷰를 불러오지 못했습니다.
        </div>
        <button
          type="button"
          className={styles.retryButton}
          onClick={() => {
            void refetch();
          }}>
          다시 시도
        </button>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className={styles.container}>
        <div className={styles.emptyState}>작성 가능한 리뷰가 없습니다.</div>
      </section>
    );
  }

  return (
    <section className={styles.container}>
      <div ref={scrollContainerRef} className={styles.scrollRow}>
        {items.map((review) => {
          return (
            <article key={review.appointmentId} className={styles.card}>
              <div className={styles.title}>{review.placeName}</div>
              <PlaceRatingMeta
                rating={review.reviewAverage}
                reviewCount={review.reviewCount}
                showReviewCountWhenZero={false}
                rowClassName={styles.scoreRow}
                starClassName={styles.star}
                textClassName={styles.scoreText}
              />
              <DateTimeMetaRow
                startAt={review.startAt}
                endsAt={review.endsAt}
                direction="column"
              />
              <Link
                href={`/dashboard/profile/reviews/${review.appointmentId}`}
                prefetch={false}
                className={styles.writeButton}>
                리뷰 남기기
              </Link>
            </article>
          );
        })}
        <div ref={sentinelRef} className={styles.loadMoreTrigger} />
      </div>
    </section>
  );
}
