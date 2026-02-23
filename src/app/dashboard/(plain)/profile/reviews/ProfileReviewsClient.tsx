'use client';

import {
  useInfiniteQuery,
  useQueryClient,
  type InfiniteData,
} from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import toast from 'react-hot-toast';

import { deleteMyReviewAction } from '@/actions/appointment';
import PlainTopNav from '@/components/ui/PlainTopNav';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { appointmentKeys } from '@/libs/query/appointmentKeys';
import {
  createMyReviewsQueryOptions,
  type MyReviewPage,
} from '@/libs/query/appointmentQueries';
import {
  invalidateAppointmentListQueries,
  invalidateAppointmentSearchQueries,
  invalidateMyReviewsQueries,
  invalidateReviewableAppointmentsQueries,
} from '@/libs/query/invalidateAppointmentQueries';

import MyReviewCard from './_components/MyReviewCard';
import * as styles from './page.css';

export default function ProfileReviewsClient() {
  const queryClient = useQueryClient();
  const queryOptions = createMyReviewsQueryOptions();
  const [openedMenuAppointmentId, setOpenedMenuAppointmentId] = useState<
    string | null
  >(null);
  const [deletingAppointmentId, setDeletingAppointmentId] = useState<
    string | null
  >(null);

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

  const reviews = data?.pages.flatMap((page: MyReviewPage) => page.reviews) ?? [];
  const hasMore = Boolean(hasNextPage);

  const handleLoadMore = useCallback(async () => {
    if (hasNextPage && !isFetchingNextPage) {
      await fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const { loadMoreRef } = useInfiniteScroll({
    onLoadMore: handleLoadMore,
    hasMore,
    isLoading: isLoading || isFetchingNextPage,
  });

  const handleToggleMenu = (appointmentId: string) => {
    setOpenedMenuAppointmentId((prev) =>
      prev === appointmentId ? null : appointmentId,
    );
  };

  const handleCloseMenu = useCallback(() => {
    setOpenedMenuAppointmentId(null);
  }, []);

  const handleDeleteReview = useCallback(
    async (appointmentId: string) => {
      if (!appointmentId || deletingAppointmentId) return;

      setDeletingAppointmentId(appointmentId);
      setOpenedMenuAppointmentId(null);

      try {
        const result = await deleteMyReviewAction({ appointmentId });
        if (!result.ok) {
          toast.error(result.message || '리뷰 삭제에 실패했습니다.');
          return;
        }

        queryClient.setQueryData<InfiniteData<MyReviewPage>>(
          queryOptions.queryKey,
          (prev) => {
            if (!prev) return prev;

            return {
              ...prev,
              pages: prev.pages.map((page) => ({
              ...page,
                reviews: page.reviews.filter(
                  (review) => review.appointmentId !== appointmentId,
                ),
              })),
            };
          },
        );

        await Promise.all([
          queryClient.invalidateQueries({ queryKey: appointmentKeys.historyRoot() }),
          invalidateMyReviewsQueries(queryClient),
          invalidateReviewableAppointmentsQueries(queryClient),
          invalidateAppointmentListQueries(queryClient),
          invalidateAppointmentSearchQueries(queryClient),
        ]);

        toast.success('리뷰를 삭제했습니다.');
      } finally {
        setDeletingAppointmentId(null);
      }
    },
    [deletingAppointmentId, queryClient, queryOptions.queryKey],
  );

  return (
    <div className={styles.page}>
      <PlainTopNav title="내 리뷰" rightHidden />

      {isLoading ? (
        <div className={styles.statusBox}>리뷰를 불러오는 중...</div>
      ) : isError ? (
        <div className={styles.statusBox}>
          {error instanceof Error
            ? error.message
            : '리뷰 목록을 불러오지 못했습니다.'}
        </div>
      ) : reviews.length === 0 ? (
        <div className={styles.statusBox}>작성한 리뷰가 없습니다.</div>
      ) : (
        <div className={styles.list}>
          {reviews.map((review) => (
            <MyReviewCard
              key={review.appointmentId}
              review={review}
              isMenuOpen={openedMenuAppointmentId === review.appointmentId}
              isDeleting={deletingAppointmentId === review.appointmentId}
              onToggleMenu={handleToggleMenu}
              onCloseMenu={handleCloseMenu}
              onDeleteReview={handleDeleteReview}
            />
          ))}
          {isFetchingNextPage ? (
            <div className={styles.statusInline}>더 불러오는 중...</div>
          ) : null}
          {hasMore && !isFetchingNextPage ? (
            <div ref={loadMoreRef} className={styles.loadMoreTrigger} />
          ) : null}
        </div>
      )}
    </div>
  );
}
