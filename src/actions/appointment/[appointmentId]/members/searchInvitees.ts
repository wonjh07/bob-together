'use server';

import { z } from 'zod';

import { parseOrFail, requireUser } from '@/actions/_common/guards';
import { actionError, actionSuccess } from '@/actions/_common/result';
import { groupSearchSchema } from '@/schemas/group';
import { isAppointmentEndedByTime } from '@/utils/appointmentStatus';

import type {
  AppointmentInviteeSummary,
  SearchAppointmentInvitableUsersResult,
} from '@/actions/appointment/types';

const searchAppointmentInvitableUsersSchema = z.object({
  appointmentId: z.string().uuid('유효한 약속 ID가 아닙니다.'),
  query: groupSearchSchema,
});

interface AppointmentRow {
  appointment_id: string;
  group_id: string;
  status: 'pending' | 'confirmed' | 'canceled';
  ends_at: string;
}

interface InviteeCandidateRow {
  user_id: string;
  name: string | null;
  nickname: string | null;
  group_members: Array<{ group_id: string }> | null;
}

interface AppointmentMemberRow {
  user_id: string;
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

  const { data: appointmentData, error: appointmentError } = await supabase
    .from('appointments')
    .select('appointment_id, group_id, status, ends_at')
    .eq('appointment_id', appointmentId)
    .maybeSingle<AppointmentRow>();

  if (appointmentError || !appointmentData) {
    return actionError('forbidden', '약속을 찾을 수 없거나 접근 권한이 없습니다.');
  }

  if (appointmentData.status === 'canceled') {
    return actionError('forbidden', '취소된 약속은 초대할 수 없습니다.');
  }

  if (isAppointmentEndedByTime(appointmentData.ends_at)) {
    return actionError('forbidden', '종료된 약속은 초대할 수 없습니다.');
  }

  const { data: inviterMembership, error: inviterMembershipError } =
    await supabase
      .from('appointment_members')
      .select('user_id')
      .eq('appointment_id', appointmentId)
      .eq('user_id', user.id)
      .maybeSingle();

  if (inviterMembershipError || !inviterMembership) {
    return actionError('forbidden', '약속 멤버만 초대할 수 있습니다.');
  }

  const [
    { data: candidates, error: candidatesError },
    { data: appointmentMembers, error: appointmentMembersError },
  ] = await Promise.all([
    supabase
      .from('users')
      .select('user_id, name, nickname, group_members!inner(group_id)')
      .eq('group_members.group_id', appointmentData.group_id)
      .or(`nickname.ilike.%${query}%,name.ilike.%${query}%`)
      .neq('user_id', user.id)
      .limit(20),
    supabase
      .from('appointment_members')
      .select('user_id')
      .eq('appointment_id', appointmentId),
  ]);

  if (candidatesError || appointmentMembersError) {
    return actionError('server-error', '초대 대상 검색 중 오류가 발생했습니다.');
  }

  const existingMemberIds = new Set(
    ((appointmentMembers as AppointmentMemberRow[] | null) ?? []).map(
      (row) => row.user_id,
    ),
  );
  const users = ((candidates as InviteeCandidateRow[] | null) ?? [])
    .filter(
      (row) =>
        row.user_id &&
        !existingMemberIds.has(row.user_id),
    )
    .slice(0, 6)
    .map(
      (row): AppointmentInviteeSummary => ({
        userId: row.user_id,
        name: row.name ?? null,
        nickname: row.nickname ?? null,
      }),
    );

  return actionSuccess({ users });
}
