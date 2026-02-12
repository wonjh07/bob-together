import {
  getAppointmentCommentsAction,
  getAppointmentDetailAction,
  listAppointmentsAction,
  searchAppointmentsByTitleAction,
} from '@/actions/appointment';
import { appointmentKeys } from '@/libs/query/appointmentKeys';

import type {
  AppointmentCommentItem,
  AppointmentDetailItem,
  AppointmentSearchCursor,
  AppointmentSearchItem,
  AppointmentListItem,
  PeriodFilter,
  TypeFilter,
} from '@/actions/appointment';
import type { QueryFunctionContext } from '@tanstack/react-query';

export const APPOINTMENT_LIST_LIMIT = 10;

export type AppointmentPage = {
  appointments: AppointmentListItem[];
  nextCursor: string | null;
};

const APPOINTMENT_SEARCH_LIMIT = 10;

type AppointmentSearchQueryKey = ReturnType<typeof appointmentKeys.search>;
type AppointmentDetailQueryKey = ReturnType<typeof appointmentKeys.detail>;
type AppointmentCommentsQueryKey = ReturnType<typeof appointmentKeys.comments>;

export type AppointmentSearchPage = {
  appointments: AppointmentSearchItem[];
  nextCursor: AppointmentSearchCursor | null;
};

export type AppointmentDetailData = {
  appointment: AppointmentDetailItem;
};

export type AppointmentCommentsData = {
  comments: AppointmentCommentItem[];
  commentCount: number;
  currentUserId: string | null;
};

export type AppointmentQueryKey = readonly (string | null)[];

export function createAppointmentListQueryOptions(
  groupId: string | null,
  period: PeriodFilter,
  type: TypeFilter,
) {
  return {
    queryKey: appointmentKeys.list(groupId, period, type) as AppointmentQueryKey,
    queryFn: async ({
      pageParam,
    }: QueryFunctionContext<AppointmentQueryKey, string | null>) => {
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
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage: AppointmentPage) => lastPage.nextCursor ?? null,
  };
}

export function createAppointmentSearchQueryOptions(query: string) {
  return {
    queryKey: appointmentKeys.search(query) as AppointmentSearchQueryKey,
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

export function createAppointmentDetailQueryOptions(appointmentId: string) {
  return {
    queryKey: appointmentKeys.detail(appointmentId) as AppointmentDetailQueryKey,
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

export function createAppointmentCommentsQueryOptions(appointmentId: string) {
  return {
    queryKey: appointmentKeys.comments(appointmentId) as AppointmentCommentsQueryKey,
    queryFn: async (_: QueryFunctionContext<AppointmentCommentsQueryKey>) => {
      const result = await getAppointmentCommentsAction(appointmentId);

      if (!result.ok || !result.data) {
        throw new Error(
          result.ok
            ? '데이터가 없습니다.'
            : result.message || '댓글을 불러오지 못했습니다.',
        );
      }

      return result.data;
    },
  };
}
