'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useCallback, useEffect, useRef } from 'react';

import DateTimeMetaRow from '@/components/ui/DateTimeMetaRow';
import PlaceRatingMeta from '@/components/ui/PlaceRatingMeta';
import { useHorizontalDragScroll } from '@/hooks/useHorizontalDragScroll';
import {
  createReviewableAppointmentsQueryOptions,
  type ReviewableAppointmentsPage,
} from '@/libs/query/appointmentQueries';
import { formatDateDot, formatTimeRange24 } from '@/utils/dateFormat';

import * as styles from './ReviewsWaitList.css';

import type { MouseEvent } from 'react';

export function ReviewsWaitList() {
  const queryOptions = createReviewableAppointmentsQueryOptions();
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const {
    containerRef,
    isDragging,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerLeave,
    onDragStart,
    consumeShouldPreventClick,
  } = useHorizontalDragScroll();

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
    const root = containerRef.current;
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
  }, [containerRef, fetchNextPage, hasNextPage, isFetchingNextPage, items.length]);

  const handleClickCapture = useCallback(
    (event: MouseEvent<HTMLElement>) => {
      if (!consumeShouldPreventClick()) return;
      const target = event.target as HTMLElement;
      if (!target.closest('a,button')) return;
      event.preventDefault();
      event.stopPropagation();
    },
    [consumeShouldPreventClick],
  );

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
        ref={containerRef}
        className={`${styles.scrollRow} ${isDragging ? styles.scrollRowDragging : ''}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerLeave}
        onDragStart={onDragStart}
        onClickCapture={handleClickCapture}>
        {items.map((review) => {
          return (
            <article key={review.appointmentId} className={styles.card}>
              <div className={styles.title}>{review.title}</div>
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
      {isFetchingNextPage ? (
        <div className={styles.inlineLoading}>더 불러오는 중...</div>
      ) : null}
    </section>
  );
}
