'use client';

import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import {
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';
import toast from 'react-hot-toast';

import {
  createAppointmentCommentAction,
  deleteAppointmentCommentAction,
  updateAppointmentCommentAction,
  type CreateAppointmentCommentResult,
  type DeleteAppointmentCommentResult,
  type UpdateAppointmentCommentResult,
} from '@/actions/appointment';
import { useInfiniteLoadMore } from '@/hooks/useInfiniteLoadMore';
import { useRequestErrorPresenter } from '@/hooks/useRequestErrorPresenter';
import { appointmentKeys } from '@/libs/query/appointmentKeys';
import { createAppointmentCommentsQueryOptions } from '@/libs/query/appointmentQueries';
import {
  invalidateMyCommentsQueries,
} from '@/libs/query/invalidateAppointmentQueries';
import { useQueryScope } from '@/provider/query-scope-provider';

import {
  appendCommentToInfiniteData,
  type AppointmentCommentsInfiniteData,
  type AppointmentListInfiniteData,
  patchCommentCountInAppointmentListData,
  removeCommentFromInfiniteData,
  replaceCommentInInfiniteData,
} from './commentCache';

interface UseAppointmentCommentsControllerParams {
  appointmentId: string;
}

const FALLBACK_CREATE_ERROR = '댓글 작성에 실패했습니다.';
const FALLBACK_UPDATE_ERROR = '댓글 수정에 실패했습니다.';
const FALLBACK_DELETE_ERROR = '댓글 삭제에 실패했습니다.';
const INPUT_REQUIRED_ERROR = '댓글을 입력해주세요.';

type CommentMutationResult =
  | CreateAppointmentCommentResult
  | UpdateAppointmentCommentResult
  | DeleteAppointmentCommentResult;

export default function useAppointmentCommentsController({
  appointmentId,
}: UseAppointmentCommentsControllerParams) {
  const queryClient = useQueryClient();
  const queryScope = useQueryScope();
  const queryOptions = useMemo(
    () => createAppointmentCommentsQueryOptions(appointmentId, queryScope),
    [appointmentId, queryScope],
  );
  const commentsQuery = useInfiniteQuery(queryOptions);
  const { openRequestError } = useRequestErrorPresenter();
  const { loadMoreRef } = useInfiniteLoadMore({
    fetchNextPage: commentsQuery.fetchNextPage,
    hasNextPage: commentsQuery.hasNextPage,
    isFetchingNextPage: commentsQuery.isFetchingNextPage,
    isLoading: commentsQuery.isLoading,
  });

  const [content, setContent] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [updatingCommentIds, setUpdatingCommentIds] = useState<Set<string>>(
    new Set(),
  );
  const [deletingCommentIds, setDeletingCommentIds] = useState<Set<string>>(
    new Set(),
  );
  const updatingCommentIdsRef = useRef(updatingCommentIds);
  const deletingCommentIdsRef = useRef(deletingCommentIds);

  const pages = commentsQuery.data?.pages;
  const comments = useMemo(
    () => (pages ?? []).flatMap((page) => page.comments),
    [pages],
  );
  const commentCount = pages?.[0]?.commentCount ?? comments.length;
  const currentUserId = pages?.[0]?.currentUserId ?? null;
  const hasMore = commentsQuery.hasNextPage ?? false;
  const isLoadingMore = commentsQuery.isFetchingNextPage;

  const presentMutationError = useCallback(
    (
      result: CommentMutationResult,
      fallbackMessage: string,
      source: string,
    ) => {
      if (result.ok && result.data) {
        return false;
      }

      const message = !result.ok
        ? result.message || fallbackMessage
        : fallbackMessage;

      openRequestError(message, {
        err: result,
        source,
      });
      return true;
    },
    [openRequestError],
  );

  const addUpdatingCommentId = useCallback((commentId: string) => {
    setUpdatingCommentIds((prev) => {
      const next = new Set(prev).add(commentId);
      updatingCommentIdsRef.current = next;
      return next;
    });
  }, []);

  const removeUpdatingCommentId = useCallback((commentId: string) => {
    setUpdatingCommentIds((prev) => {
      const next = new Set(prev);
      next.delete(commentId);
      updatingCommentIdsRef.current = next;
      return next;
    });
  }, []);

  const addDeletingCommentId = useCallback((commentId: string) => {
    setDeletingCommentIds((prev) => {
      const next = new Set(prev).add(commentId);
      deletingCommentIdsRef.current = next;
      return next;
    });
  }, []);

  const removeDeletingCommentId = useCallback((commentId: string) => {
    setDeletingCommentIds((prev) => {
      const next = new Set(prev);
      next.delete(commentId);
      deletingCommentIdsRef.current = next;
      return next;
    });
  }, []);

  const isCommentBusy = useCallback((commentId: string) => {
    return (
      updatingCommentIdsRef.current.has(commentId)
      || deletingCommentIdsRef.current.has(commentId)
    );
  }, []);

  const applyListCommentCountDelta = useCallback(
    (delta: -1 | 0 | 1) => {
      if (delta === 0) {
        return;
      }

      queryClient.setQueriesData<AppointmentListInfiniteData>(
        { queryKey: appointmentKeys.listRoot() },
        (prev) =>
          patchCommentCountInAppointmentListData(prev, appointmentId, delta),
      );
    },
    [appointmentId, queryClient],
  );


  
  const submitComment = useCallback(async () => {
    if (isCreating) return;

    const trimmed = content.trim();
    if (!trimmed) {
      setErrorMessage(INPUT_REQUIRED_ERROR);
      return;
    }

    setErrorMessage('');
    setIsCreating(true);

    try {
      const result = await createAppointmentCommentAction({
        appointmentId,
        content: trimmed,
      });

      if (
        presentMutationError(
          result,
          FALLBACK_CREATE_ERROR,
          'AppointmentCommentsSection.submitComment.result',
        )
      ) {
        return;
      }
      if (!result.ok || !result.data) {
        return;
      }

      const { comment, commentCountDelta } = result.data;
      queryClient.setQueryData<AppointmentCommentsInfiniteData>(
        queryOptions.queryKey,
        (prev) => appendCommentToInfiniteData(prev, comment),
      );
      applyListCommentCountDelta(commentCountDelta);
      await invalidateMyCommentsQueries(queryClient);
      setContent('');
      toast.success('댓글이 등록되었습니다.');
    } finally {
      setIsCreating(false);
    }
  }, [
    appointmentId,
    content,
    isCreating,
    presentMutationError,
    queryClient,
    queryOptions.queryKey,
    applyListCommentCountDelta,
  ]);

  const updateComment = useCallback(
    async (commentId: string, contentToUpdate: string) => {
      if (isCommentBusy(commentId)) {
        return false;
      }

      const trimmed = contentToUpdate.trim();
      if (!trimmed) {
        toast.error(INPUT_REQUIRED_ERROR);
        return false;
      }

      addUpdatingCommentId(commentId);

      try {
        const result = await updateAppointmentCommentAction({
          appointmentId,
          commentId,
          content: trimmed,
        });

        if (
          presentMutationError(
            result,
            FALLBACK_UPDATE_ERROR,
            'AppointmentCommentsSection.submitEdit.result',
          )
        ) {
          return false;
        }
        if (!result.ok || !result.data) {
          return false;
        }

        const { comment, commentCountDelta } = result.data;
        queryClient.setQueryData<AppointmentCommentsInfiniteData>(
          queryOptions.queryKey,
          (prev) =>
            replaceCommentInInfiniteData(prev, commentId, comment),
        );
        applyListCommentCountDelta(commentCountDelta);
        await invalidateMyCommentsQueries(queryClient);
        toast.success('댓글이 수정되었습니다.');
        return true;
      } finally {
        removeUpdatingCommentId(commentId);
      }
    },
    [
      addUpdatingCommentId,
      appointmentId,
      isCommentBusy,
      presentMutationError,
      queryClient,
      queryOptions.queryKey,
      removeUpdatingCommentId,
      applyListCommentCountDelta,
    ],
  );

  const deleteComment = useCallback(
    async (commentId: string) => {
      if (isCommentBusy(commentId)) {
        return false;
      }

      addDeletingCommentId(commentId);

      try {
        const result = await deleteAppointmentCommentAction({
          appointmentId,
          commentId,
        });

        if (
          presentMutationError(
            result,
            FALLBACK_DELETE_ERROR,
            'AppointmentCommentsSection.handleDelete.result',
          )
        ) {
          return false;
        }
        if (!result.ok || !result.data) {
          return false;
        }

        const { commentId: deletedCommentId, commentCountDelta } = result.data;
        let removed = false;
        queryClient.setQueryData<AppointmentCommentsInfiniteData>(
          queryOptions.queryKey,
          (prev) => {
            const next = removeCommentFromInfiniteData(prev, deletedCommentId);
            removed = next.removed;
            return next.nextData;
          },
        );

        if (!removed) {
          return false;
        }

        applyListCommentCountDelta(commentCountDelta);
        await invalidateMyCommentsQueries(queryClient);
        toast.success('댓글이 삭제되었습니다.');
        return true;
      } finally {
        removeDeletingCommentId(commentId);
      }
    },
    [
      addDeletingCommentId,
      appointmentId,
      isCommentBusy,
      presentMutationError,
      queryClient,
      queryOptions.queryKey,
      removeDeletingCommentId,
      applyListCommentCountDelta,
    ],
  );

  return {
    commentsQuery,
    comments,
    commentCount,
    currentUserId,
    hasMore,
    isLoadingMore,
    loadMoreRef,
    content,
    errorMessage,
    isCreating,
    updatingCommentIds,
    deletingCommentIds,
    isCommentBusy,
    setContent,
    submitComment,
    updateComment,
    deleteComment,
  };
}
