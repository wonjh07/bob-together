'use client';

import {
  useInfiniteQuery,
  useQueryClient,
  type InfiniteData,
} from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import toast from 'react-hot-toast';

import { deleteAppointmentCommentAction } from '@/actions/appointment';
import InlineLoading from '@/components/ui/InlineLoading';
import ListStateView from '@/components/ui/ListStateView';
import PlainTopNav from '@/components/ui/PlainTopNav';
import { useInfiniteLoadMore } from '@/hooks/useInfiniteLoadMore';
import {
  createMyCommentsQueryOptions,
  type MyCommentsPage,
} from '@/libs/query/appointmentQueries';
import {
  invalidateMyCommentMutationQueries,
} from '@/libs/query/invalidateAppointmentQueries';

import MyCommentCard from './_components/MyCommentCard';
import * as styles from './page.css';

export default function ProfileCommentsClient() {
  const queryClient = useQueryClient();
  const queryOptions = createMyCommentsQueryOptions();
  const [openedMenuCommentId, setOpenedMenuCommentId] = useState<string | null>(
    null,
  );
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);

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

  const comments = data?.pages.flatMap((page: MyCommentsPage) => page.comments) ?? [];
  const { hasMore, loadMoreRef } = useInfiniteLoadMore({
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  });

  const handleToggleMenu = (commentId: string) => {
    setOpenedMenuCommentId((prev) => (prev === commentId ? null : commentId));
  };

  const handleCloseMenu = useCallback(() => {
    setOpenedMenuCommentId(null);
  }, []);

  const handleDeleteComment = useCallback(
    async (appointmentId: string, commentId: string) => {
      if (!appointmentId || !commentId || deletingCommentId) return;

      setDeletingCommentId(commentId);
      setOpenedMenuCommentId(null);

      try {
        const result = await deleteAppointmentCommentAction({
          appointmentId,
          commentId,
        });
        if (!result.ok) {
          toast.error(result.message || '댓글 삭제에 실패했습니다.');
          return;
        }

        queryClient.setQueryData<InfiniteData<MyCommentsPage>>(
          queryOptions.queryKey,
          (prev) => {
            if (!prev) return prev;

            return {
              ...prev,
              pages: prev.pages.map((page) => ({
                ...page,
                comments: page.comments.filter(
                  (comment) => comment.commentId !== commentId,
                ),
              })),
            };
          },
        );

        await invalidateMyCommentMutationQueries(queryClient, appointmentId);

        toast.success('댓글을 삭제했습니다.');
      } finally {
        setDeletingCommentId(null);
      }
    },
    [deletingCommentId, queryClient, queryOptions.queryKey],
  );
  const hasState = isLoading || isError || comments.length === 0;

  return (
    <div className={styles.page}>
      <PlainTopNav title="내 댓글" rightHidden />

      {hasState ? (
        <ListStateView
          isLoading={isLoading}
          isError={isError}
          isEmpty={comments.length === 0}
          error={error}
          loadingVariant="spinner"
          loadingText="댓글을 불러오는 중..."
          emptyText="작성한 댓글이 없습니다."
          defaultErrorText="댓글 목록을 불러오지 못했습니다."
          className={styles.statusBox}
        />
      ) : (
        <div className={styles.list}>
          {comments.map((comment) => (
            <MyCommentCard
              key={comment.commentId}
              comment={comment}
              isMenuOpen={openedMenuCommentId === comment.commentId}
              isDeleting={deletingCommentId === comment.commentId}
              onToggleMenu={handleToggleMenu}
              onCloseMenu={handleCloseMenu}
              onDeleteComment={handleDeleteComment}
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
