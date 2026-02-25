'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useEffect, useRef } from 'react';

import DateTimeMetaRow from '@/components/ui/DateTimeMetaRow';
import PlaceRatingMeta from '@/components/ui/PlaceRatingMeta';
import {
  createReviewableAppointmentsQueryOptions,
  type ReviewableAppointmentsPage,
} from '@/libs/query/appointmentQueries';
import { formatDateDot, formatTimeRange24 } from '@/utils/dateFormat';

import * as styles from './ReviewsWaitList.css';

import type { WheelEvent } from 'react';

export function ReviewsWaitList() {
  const queryOptions = createReviewableAppointmentsQueryOptions();
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
  } = useInfiniteQuery({
    ...queryOptions,
  });

  const items =
    data?.pages.flatMap((page: ReviewableAppointmentsPage) => page.appointments) ??
    [];

  useEffect(() => {
    const root = scrollContainerRef.current;
    const target = sentinelRef.current;
    if (!root || !target || !hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (!entry?.isIntersecting) return;
        void fetchNextPage();
      },
      {
        root,
        threshold: 0.1,
        rootMargin: '0px 160px 0px 0px',
      },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    items.length,
    scrollContainerRef,
  ]);

  const handleHorizontalWheel = (event: WheelEvent<HTMLDivElement>) => {
    const container = scrollContainerRef.current;
    if (!container) return;
    if (container.scrollWidth <= container.clientWidth) return;

    // Trackpad horizontal gesture should keep native behavior.
    if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;

    event.preventDefault();
    container.scrollLeft += event.deltaY;
  };

  if (isLoading) {
    return (
      <section className={styles.container}>
        <div className={styles.emptyState}>작성 가능한 리뷰를 불러오는 중...</div>
      </section>
    );
  }

  if (isError) {
    return (
      <section className={styles.container}>
        <div className={styles.emptyState}>
          {error instanceof Error
            ? error.message
            : '작성 가능한 리뷰를 불러오지 못했습니다.'}
        </div>
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
      <div
        ref={scrollContainerRef}
        className={styles.scrollRow}
        onWheel={handleHorizontalWheel}>
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
                date={formatDateDot(review.startAt)}
                timeRange={formatTimeRange24(review.startAt, review.endsAt)}
                direction="column"
                itemClassName={styles.infoRow}
                dateIconSize={18}
                timeIconSize={18}
              />
              <Link
                href={`/dashboard/profile/reviews/${review.appointmentId}`}
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
