'use client';

import {
  useInfiniteQuery,
  useQueryClient,
  type InfiniteData,
} from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import toast from 'react-hot-toast';

import { deleteMyReviewAction } from '@/actions/appointment';
import InlineLoading from '@/components/ui/InlineLoading';
import ListStateView from '@/components/ui/ListStateView';
import PlainTopNav from '@/components/ui/PlainTopNav';
import { useInfiniteLoadMore } from '@/hooks/useInfiniteLoadMore';
import {
  createMyReviewsQueryOptions,
  type MyReviewPage,
} from '@/libs/query/appointmentQueries';
import {
  invalidateReviewMutationQueries,
} from '@/libs/query/invalidateAppointmentQueries';
import { useQueryScope } from '@/provider/query-scope-provider';

import MyReviewCard from './_components/MyReviewCard';
import * as styles from './page.css';

export default function ProfileReviewsClient() {
  const queryClient = useQueryClient();
  const queryScope = useQueryScope();
  const queryOptions = createMyReviewsQueryOptions(queryScope);
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
  const { hasMore, loadMoreRef } = useInfiniteLoadMore({
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
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
    async (appointmentId: string, placeId: string) => {
      if (!appointmentId || !placeId || deletingAppointmentId) return;

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

        await invalidateReviewMutationQueries(queryClient, {
          appointmentId,
          placeId,
        });

        toast.success('리뷰를 삭제했습니다.');
      } finally {
        setDeletingAppointmentId(null);
      }
    },
    [deletingAppointmentId, queryClient, queryOptions.queryKey],
  );
  const hasState = isLoading || isError || reviews.length === 0;

  return (
    <div className={styles.page}>
      <PlainTopNav title="내 리뷰" rightHidden />

      {hasState ? (
        <ListStateView
          isLoading={isLoading}
          isError={isError}
          isEmpty={reviews.length === 0}
          error={error}
          loadingVariant="spinner"
          loadingText="리뷰를 불러오는 중..."
          emptyText="작성한 리뷰가 없습니다."
          defaultErrorText="리뷰 목록을 불러오지 못했습니다."
          className={styles.statusBox}
        />
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
