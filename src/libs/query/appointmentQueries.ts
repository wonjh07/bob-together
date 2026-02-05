import { listAppointmentsAction } from '@/actions/appointment';
import { appointmentKeys } from '@/libs/query/appointmentKeys';

import type {
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
