'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import Link from 'next/link';

import AppointmentPlaceMeta from '@/components/ui/AppointmentPlaceMeta';
import InlineLoading from '@/components/ui/InlineLoading';
import ListStateView from '@/components/ui/ListStateView';
import PlainTopNav from '@/components/ui/PlainTopNav';
import { useInfiniteLoadMore } from '@/hooks/useInfiniteLoadMore';
import {
  createReviewableAppointmentsQueryOptions,
  type ReviewableAppointmentsPage,
} from '@/libs/query/appointmentQueries';
import { formatDateDot } from '@/utils/dateFormat';

import * as styles from './page.css';
import * as cardStyles from '../../history/_components/HistoryAppointmentCard.css';

export default function ProfileReviewWaitListClient() {
  const queryOptions = createReviewableAppointmentsQueryOptions();

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

  const appointments =
    data?.pages.flatMap(
      (page: ReviewableAppointmentsPage) => page.appointments,
    ) ?? [];
  const { hasMore, loadMoreRef } = useInfiniteLoadMore({
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  });

  const isEmpty = !isLoading && appointments.length === 0;
  const hasState = isLoading || isError || isEmpty;

  return (
    <div className={styles.page}>
      <PlainTopNav title="작성 가능한 리뷰" rightHidden />

      {hasState ? (
        <ListStateView
          isLoading={isLoading}
          isError={isError}
          isEmpty={isEmpty}
          error={error}
          loadingVariant="spinner"
          loadingText="작성 가능한 리뷰를 불러오는 중..."
          emptyText="작성 가능한 리뷰가 없습니다."
          defaultErrorText="작성 가능한 리뷰를 불러오지 못했습니다."
          className={styles.statusBox}
        />
      ) : (
        <div className={styles.list}>
          {appointments.map((appointment) => (
            <article
              key={appointment.appointmentId}
              className={cardStyles.card}>
              <div className={cardStyles.cardHead}>
                <p className={cardStyles.date}>
                  {formatDateDot(appointment.startAt)}
                </p>
              </div>

              <AppointmentPlaceMeta
                title={appointment.title}
                titleAs="h2"
                titleClassName={cardStyles.title}
                placeName={appointment.placeName}
                placeNameAs="p"
                placeNameClassName={cardStyles.placeName}
                placeHref={`/dashboard/places/${appointment.placeId}`}
                rating={appointment.reviewAverage}
                reviewCount={appointment.reviewCount}
                metaClassName={cardStyles.placeMeta}
                starClassName={cardStyles.star}
                showReviewCountWhenZero={false}
              />

              <div className={cardStyles.buttonRow}>
                <Link
                  href={`/dashboard/appointments/${appointment.appointmentId}`}
                  className={cardStyles.detailButton}>
                  상세보기
                </Link>
                <Link
                  href={`/dashboard/profile/reviews/${appointment.appointmentId}`}
                  className={cardStyles.reviewButton}>
                  리뷰 남기기
                </Link>
              </div>
            </article>
          ))}
          {isFetchingNextPage ? (
            <InlineLoading text="더 불러오는 중..." className={styles.statusInline} />
          ) : null}
          {hasMore && !isFetchingNextPage ? (
            <div ref={loadMoreRef} className={styles.loadMoreTrigger} />
          ) : null}
        </div>
      )}
    </div>
  );
}
