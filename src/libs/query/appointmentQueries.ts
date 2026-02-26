import {
  getAppointmentCommentsAction,
  getAppointmentDetailAction,
  getAppointmentInvitationStateAction,
  getAppointmentReviewTargetAction,
  listAppointmentHistoryAction,
  listReviewableAppointmentsAction,
  listMyCommentsAction,
  listAppointmentsAction,
  listMyReviewsAction,
  searchAppointmentsByTitleAction,
} from '@/actions/appointment';
import { appointmentKeys } from '@/libs/query/appointmentKeys';
import { type QueryScope } from '@/libs/query/queryScope';

import type {
  AppointmentCommentItem,
  AppointmentCommentsCursor,
  AppointmentDetailItem,
  AppointmentHistoryCursor,
  AppointmentHistoryItem,
  AppointmentListCursor,
  ReviewableAppointmentItem,
  ReviewableAppointmentsCursor,
  AppointmentReviewTargetItem,
  AppointmentSearchCursor,
  AppointmentSearchItem,
  AppointmentListItem,
  MyCommentCursor,
  MyCommentItem,
  MyReviewCursor,
  MyReviewItem,
  PeriodFilter,
  TypeFilter,
} from '@/actions/appointment';
import type { QueryFunctionContext } from '@tanstack/react-query';

export const APPOINTMENT_LIST_LIMIT = 10;

export type AppointmentPage = {
  appointments: AppointmentListItem[];
  nextCursor: AppointmentListCursor | null;
};

const APPOINTMENT_SEARCH_LIMIT = 10;
const APPOINTMENT_HISTORY_LIMIT = 10;
const APPOINTMENT_COMMENTS_LIMIT = 20;
const MY_COMMENT_LIST_LIMIT = 10;
const MY_REVIEW_LIST_LIMIT = 10;
const REVIEWABLE_APPOINTMENT_LIST_LIMIT = 6;

type AppointmentSearchQueryKey = ReturnType<typeof appointmentKeys.search>;
type AppointmentHistoryQueryKey = ReturnType<typeof appointmentKeys.history>;
type MyCommentsQueryKey = ReturnType<typeof appointmentKeys.myComments>;
type MyReviewListQueryKey = ReturnType<typeof appointmentKeys.myReviews>;
type ReviewableAppointmentsQueryKey = ReturnType<typeof appointmentKeys.reviewable>;
type AppointmentReviewTargetQueryKey = ReturnType<
  typeof appointmentKeys.reviewTarget
>;
type AppointmentDetailQueryKey = ReturnType<typeof appointmentKeys.detail>;
type AppointmentInvitationStateQueryKey = ReturnType<
  typeof appointmentKeys.invitationState
>;
type AppointmentCommentsQueryKey = ReturnType<typeof appointmentKeys.comments>;

export type AppointmentSearchPage = {
  appointments: AppointmentSearchItem[];
  nextCursor: AppointmentSearchCursor | null;
};

export type AppointmentHistoryPage = {
  appointments: AppointmentHistoryItem[];
  nextCursor: AppointmentHistoryCursor | null;
};

export type MyReviewPage = {
  reviews: MyReviewItem[];
  nextCursor: MyReviewCursor | null;
};

export type ReviewableAppointmentsPage = {
  appointments: ReviewableAppointmentItem[];
  nextCursor: ReviewableAppointmentsCursor | null;
};

export type MyCommentsPage = {
  comments: MyCommentItem[];
  nextCursor: MyCommentCursor | null;
};

export type AppointmentDetailData = {
  appointment: AppointmentDetailItem;
};

export type AppointmentReviewTargetData = {
  target: AppointmentReviewTargetItem;
};

export type AppointmentCommentsPage = {
  comments: AppointmentCommentItem[];
  commentCount: number;
  nextCursor: AppointmentCommentsCursor | null;
  currentUserId: string;
};

export type AppointmentInvitationStateData = {
  memberIds: string[];
  pendingInviteeIds: string[];
};

export type AppointmentQueryKey = readonly (string | null)[];

export function createAppointmentListQueryOptions(
  groupId: string | null,
  period: PeriodFilter,
  type: TypeFilter,
  scope?: QueryScope,
) {
  return {
    queryKey: appointmentKeys.list(
      groupId,
      period,
      type,
      scope,
    ) as AppointmentQueryKey,
    queryFn: async ({
      pageParam,
    }: QueryFunctionContext<
      AppointmentQueryKey,
      AppointmentListCursor | null
    >) => {
      if (!groupId) {
        return { appointments: [], nextCursor: null };
      }

      const result = await listAppointmentsAction({
        groupId,
        period,
        type,
        cursor: pageParam ?? undefined,
        limit: APPOINTMENT_LIST_LIMIT,
      });

      if (!result.ok || !result.data) {
        throw new Error(
          result.ok
            ? '데이터가 없습니다.'
            : result.message || '약속 목록을 가져올 수 없습니다.',
        );
      }

      return result.data;
    },
    initialPageParam: null as AppointmentListCursor | null,
    getNextPageParam: (lastPage: AppointmentPage) => lastPage.nextCursor ?? null,
  };
}

export function createAppointmentSearchQueryOptions(
  query: string,
  scope?: QueryScope,
) {
  return {
    queryKey: appointmentKeys.search(query, scope) as AppointmentSearchQueryKey,
    queryFn: async ({
      pageParam,
    }: QueryFunctionContext<
      AppointmentSearchQueryKey,
      AppointmentSearchCursor | null
    >) => {
      if (!query) {
        return { appointments: [], nextCursor: null };
      }

      const result = await searchAppointmentsByTitleAction({
        query,
        cursor: pageParam ?? undefined,
        limit: APPOINTMENT_SEARCH_LIMIT,
      });

      if (!result.ok || !result.data) {
        throw new Error(
          result.ok
            ? '데이터가 없습니다.'
            : result.message || '약속 검색에 실패했습니다.',
        );
      }

      return result.data;
    },
    initialPageParam: null as AppointmentSearchCursor | null,
    getNextPageParam: (lastPage: AppointmentSearchPage) =>
      lastPage.nextCursor ?? null,
  };
}

export function createAppointmentHistoryQueryOptions(scope?: QueryScope) {
  return {
    queryKey: appointmentKeys.history(scope) as AppointmentHistoryQueryKey,
    queryFn: async ({
      pageParam,
    }: QueryFunctionContext<
      AppointmentHistoryQueryKey,
      AppointmentHistoryCursor | null
    >) => {
      const result = await listAppointmentHistoryAction({
        cursor: pageParam ?? undefined,
        limit: APPOINTMENT_HISTORY_LIMIT,
      });

      if (!result.ok || !result.data) {
        throw new Error(
          result.ok
            ? '데이터가 없습니다.'
            : result.message || '히스토리 약속을 불러오지 못했습니다.',
        );
      }

      return result.data;
    },
    initialPageParam: null as AppointmentHistoryCursor | null,
    getNextPageParam: (lastPage: AppointmentHistoryPage) =>
      lastPage.nextCursor ?? null,
  };
}

export function createMyReviewsQueryOptions(scope?: QueryScope) {
  return {
    queryKey: appointmentKeys.myReviews(scope) as MyReviewListQueryKey,
    queryFn: async ({
      pageParam,
    }: QueryFunctionContext<MyReviewListQueryKey, MyReviewCursor | null>) => {
      const result = await listMyReviewsAction({
        cursor: pageParam ?? undefined,
        limit: MY_REVIEW_LIST_LIMIT,
      });

      if (!result.ok || !result.data) {
        throw new Error(
          result.ok
            ? '데이터가 없습니다.'
            : result.message || '내 리뷰 목록을 불러오지 못했습니다.',
        );
      }

      return result.data;
    },
    initialPageParam: null as MyReviewCursor | null,
    getNextPageParam: (lastPage: MyReviewPage) => lastPage.nextCursor ?? null,
  };
}

export function createMyCommentsQueryOptions(scope?: QueryScope) {
  return {
    queryKey: appointmentKeys.myComments(scope) as MyCommentsQueryKey,
    queryFn: async ({
      pageParam,
    }: QueryFunctionContext<MyCommentsQueryKey, MyCommentCursor | null>) => {
      const result = await listMyCommentsAction({
        cursor: pageParam ?? undefined,
        limit: MY_COMMENT_LIST_LIMIT,
      });

      if (!result.ok || !result.data) {
        throw new Error(
          result.ok
            ? '데이터가 없습니다.'
            : result.message || '내 댓글 목록을 불러오지 못했습니다.',
        );
      }

      return result.data;
    },
    initialPageParam: null as MyCommentCursor | null,
    getNextPageParam: (lastPage: MyCommentsPage) => lastPage.nextCursor ?? null,
  };
}

export function createReviewableAppointmentsQueryOptions(scope?: QueryScope) {
  return {
    queryKey: appointmentKeys.reviewable(scope) as ReviewableAppointmentsQueryKey,
    queryFn: async ({
      pageParam,
    }: QueryFunctionContext<
      ReviewableAppointmentsQueryKey,
      ReviewableAppointmentsCursor | null
    >) => {
      const result = await listReviewableAppointmentsAction({
        cursor: pageParam ?? undefined,
        limit: REVIEWABLE_APPOINTMENT_LIST_LIMIT,
      });

      if (!result.ok || !result.data) {
        throw new Error(
          result.ok
            ? '데이터가 없습니다.'
            : result.message || '작성 가능한 리뷰를 불러오지 못했습니다.',
        );
      }

      return result.data;
    },
    initialPageParam: null as ReviewableAppointmentsCursor | null,
    getNextPageParam: (lastPage: ReviewableAppointmentsPage) =>
      lastPage.nextCursor ?? null,
  };
}

export function createAppointmentReviewTargetQueryOptions(
  appointmentId: string,
  scope?: QueryScope,
) {
  return {
    queryKey: appointmentKeys.reviewTarget(
      appointmentId,
      scope,
    ) as AppointmentReviewTargetQueryKey,
    queryFn: async (_: QueryFunctionContext<AppointmentReviewTargetQueryKey>) => {
      const result = await getAppointmentReviewTargetAction(appointmentId);

      if (!result.ok || !result.data) {
        throw new Error(
          result.ok
            ? '데이터가 없습니다.'
            : result.message || '리뷰 대상을 불러오지 못했습니다.',
        );
      }

      return result.data;
    },
  };
}

export function createAppointmentDetailQueryOptions(
  appointmentId: string,
  scope?: QueryScope,
) {
  return {
    queryKey: appointmentKeys.detail(
      appointmentId,
      scope,
    ) as AppointmentDetailQueryKey,
    queryFn: async (_: QueryFunctionContext<AppointmentDetailQueryKey>) => {
      const result = await getAppointmentDetailAction(appointmentId);

      if (!result.ok || !result.data) {
        throw new Error(
          result.ok
            ? '데이터가 없습니다.'
            : result.message || '약속 정보를 불러올 수 없습니다.',
        );
      }

      return result.data;
    },
  };
}

export function createAppointmentCommentsQueryOptions(
  appointmentId: string,
  scope?: QueryScope,
) {
  return {
    queryKey: appointmentKeys.comments(
      appointmentId,
      scope,
    ) as AppointmentCommentsQueryKey,
    queryFn: async ({
      pageParam,
    }: QueryFunctionContext<
      AppointmentCommentsQueryKey,
      AppointmentCommentsCursor | null
    >) => {
      const result = await getAppointmentCommentsAction({
        appointmentId,
        cursor: pageParam ?? undefined,
        limit: APPOINTMENT_COMMENTS_LIMIT,
      });

      if (!result.ok || !result.data) {
        throw new Error(
          result.ok
            ? '데이터가 없습니다.'
            : result.message || '댓글을 불러오지 못했습니다.',
        );
      }

      return result.data;
    },
    initialPageParam: null as AppointmentCommentsCursor | null,
    getNextPageParam: (lastPage: AppointmentCommentsPage) =>
      lastPage.nextCursor ?? null,
  };
}

export function createAppointmentInvitationStateQueryOptions(
  appointmentId: string,
  scope?: QueryScope,
) {
  return {
    queryKey: appointmentKeys.invitationState(
      appointmentId,
      scope,
    ) as AppointmentInvitationStateQueryKey,
    queryFn: async (_: QueryFunctionContext<AppointmentInvitationStateQueryKey>) => {
      const result = await getAppointmentInvitationStateAction(appointmentId);

      if (!result.ok || !result.data) {
        throw new Error(
          result.ok
            ? '데이터가 없습니다.'
            : result.message || '초대 상태를 불러오지 못했습니다.',
        );
      }

      return result.data;
    },
  };
}
