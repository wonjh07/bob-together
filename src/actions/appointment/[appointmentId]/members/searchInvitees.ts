'use server';

import { z } from 'zod';

import { parseOrFail, requireUser } from '@/actions/_common/guards';
import { actionError, actionSuccess } from '@/actions/_common/result';
import { groupSearchSchema } from '@/schemas/group';

import type {
  AppointmentInviteeSummary,
  SearchAppointmentInvitableUsersResult,
} from '@/actions/appointment/types';

const searchAppointmentInvitableUsersSchema = z.object({
  appointmentId: z.string().uuid('유효한 약속 ID가 아닙니다.'),
  query: groupSearchSchema,
});

interface InviteeCandidateRow {
  user_id: string;
  name: string | null;
  nickname: string | null;
}

interface SearchAppointmentInviteesRpcRow {
  ok: boolean;
  error_code: string | null;
  users: unknown;
}

export async function searchAppointmentInvitableUsersAction(params: {
  appointmentId: string;
  query: string;
}): Promise<SearchAppointmentInvitableUsersResult> {
  const parsed = parseOrFail(searchAppointmentInvitableUsersSchema, params);
  if (!parsed.ok) {
    return parsed;
  }

  const auth = await requireUser();
  if (!auth.ok) {
    return auth;
  }

  const { supabase, user } = auth;
  const { appointmentId, query } = parsed.data;

  const searchInviteesRpc =
    'search_appointment_invitable_users_transactional' as never;
  const searchInviteesParams = {
    p_inviter_id: user.id,
    p_appointment_id: appointmentId,
    p_query: query,
    p_limit: 6,
    p_candidate_limit: 20,
  } as never;
  const { data, error } = await supabase.rpc(searchInviteesRpc, searchInviteesParams);

  if (error) {
    if (error.code === '42501') {
      return actionError('forbidden', '약속을 찾을 수 없거나 접근 권한이 없습니다.');
    }
    return actionError('server-error', '초대 대상 검색 중 오류가 발생했습니다.');
  }

  const row = ((data as SearchAppointmentInviteesRpcRow[] | null) ?? [])[0] ?? null;
  if (!row) {
    return actionError('server-error', '초대 대상 검색 중 오류가 발생했습니다.');
  }

  if (!row.ok) {
    switch (row.error_code) {
      case 'forbidden':
        return actionError('forbidden', '약속을 찾을 수 없거나 접근 권한이 없습니다.');
      case 'forbidden-not-member':
        return actionError('forbidden', '약속 멤버만 초대할 수 있습니다.');
      case 'forbidden-appointment-canceled':
        return actionError('forbidden', '취소된 약속은 초대할 수 없습니다.');
      case 'forbidden-appointment-ended':
        return actionError('forbidden', '종료된 약속은 초대할 수 없습니다.');
      default:
        return actionError('server-error', '초대 대상 검색 중 오류가 발생했습니다.');
    }
  }

  const users = (Array.isArray(row.users) ? (row.users as InviteeCandidateRow[]) : [])
    .filter((candidate) => Boolean(candidate?.user_id))
    .map(
      (row): AppointmentInviteeSummary => ({
        userId: row.user_id,
        name: row.name ?? null,
        nickname: row.nickname ?? null,
      }),
    );

  return actionSuccess({ users });
}
