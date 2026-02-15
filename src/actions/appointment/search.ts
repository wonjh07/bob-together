'use server';

import { parseOrFail, requireUser } from '@/actions/_common/guards';
import { actionError, actionSuccess } from '@/actions/_common/result';
import { appointmentSearchSchema } from '@/schemas/appointment';

import type {
  AppointmentSearchCursor,
  AppointmentSearchItem,
  SearchAppointmentsResult,
} from './types';

interface SearchAppointmentsByTitleParams {
  query: string;
  cursor?: AppointmentSearchCursor | null;
  limit?: number;
}

interface SearchAppointmentsRow {
  appointment_id: string;
  title: string;
  start_at: string;
  ends_at: string;
  host_name: string | null;
  host_nickname: string | null;
  host_profile_image: string | null;
  member_count: number;
}

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 30;

export async function searchAppointmentsByTitleAction(
  params: SearchAppointmentsByTitleParams,
): Promise<SearchAppointmentsResult> {
  const parsed = parseOrFail(appointmentSearchSchema, params.query);
  if (!parsed.ok) {
    return actionError(
      'invalid-format',
      parsed.message || '검색어를 입력해주세요.',
    );
  }

  const auth = await requireUser();
  if (!auth.ok) {
    return auth;
  }
  const { supabase, user } = auth;

  const limit = Math.min(Math.max(params.limit ?? DEFAULT_LIMIT, 1), MAX_LIMIT);
  const cursor = params.cursor ?? null;

  const { data, error } = await supabase.rpc('search_appointments_with_count', {
    p_user_id: user.id,
    p_query: parsed.data,
    p_limit: limit,
    p_cursor_start_at: cursor?.startAt ?? undefined,
    p_cursor_appointment_id: cursor?.appointmentId ?? undefined,
  });

  if (error) {
    return actionError('server-error', '약속 검색 중 오류가 발생했습니다.');
  }

  const rows = ((data as SearchAppointmentsRow[] | null) ?? []).filter(
    (row) => row.appointment_id && row.start_at,
  );

  const hasMore = rows.length > limit;
  const visibleRows = hasMore ? rows.slice(0, limit) : rows;
  const lastRow = visibleRows[visibleRows.length - 1];

  const appointments: AppointmentSearchItem[] = visibleRows.map((row) => ({
    appointmentId: row.appointment_id,
    title: row.title,
    startAt: row.start_at,
    endsAt: row.ends_at,
    hostName: row.host_name,
    hostNickname: row.host_nickname,
    hostProfileImage: row.host_profile_image,
    memberCount: Number(row.member_count) || 0,
  }));

  const nextCursor: AppointmentSearchCursor | null =
    hasMore && lastRow
      ? {
          startAt: lastRow.start_at,
          appointmentId: lastRow.appointment_id,
        }
      : null;

  return actionSuccess({
    appointments,
    nextCursor,
  });
}
