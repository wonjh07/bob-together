'use server';

import { z } from 'zod';

import { parseOrFail, requireUser } from '@/actions/_common/guards';
import { actionError, actionSuccess } from '@/actions/_common/result';

import type {
  AppointmentMemberItem,
  GetAppointmentMembersResult,
} from '@/actions/appointment/types';

const appointmentIdSchema = z.string().uuid('유효한 약속 ID가 아닙니다.');

interface AppointmentMemberRow {
  user_id: string;
  role: 'owner' | 'member';
  name: string | null;
  nickname: string | null;
  profile_image: string | null;
}

interface GetAppointmentMembersRpcRow {
  ok: boolean;
  error_code: string | null;
  member_count: number | null;
  members: unknown;
}

function mapRpcMembers(members: unknown): AppointmentMemberItem[] {
  if (!Array.isArray(members)) {
    return [];
  }

  return members.flatMap((member) => {
    if (!member || typeof member !== 'object') {
      return [];
    }

    const row = member as AppointmentMemberRow;
    if (
      typeof row.user_id !== 'string'
      || (row.role !== 'owner' && row.role !== 'member')
    ) {
      return [];
    }

    return [{
      userId: row.user_id,
      role: row.role,
      name: typeof row.name === 'string' ? row.name : null,
      nickname: typeof row.nickname === 'string' ? row.nickname : null,
      profileImage:
        typeof row.profile_image === 'string'
          ? row.profile_image
          : null,
    }];
  });
}

export async function getAppointmentMembersAction(
  appointmentId: string,
): Promise<GetAppointmentMembersResult> {
  const parsed = parseOrFail(appointmentIdSchema, appointmentId);
  if (!parsed.ok) {
    return parsed;
  }

  const auth = await requireUser();
  if (!auth.ok) {
    return auth;
  }

  const { supabase, user } = auth;
  const getMembersRpc = 'get_appointment_members_with_count' as never;
  const getMembersParams = {
    p_user_id: user.id,
    p_appointment_id: parsed.data,
  } as never;
  const { data, error } = await supabase.rpc(getMembersRpc, getMembersParams);

  if (error) {
    if (error.code === '42501') {
      return actionError('forbidden', '약속을 찾을 수 없거나 접근 권한이 없습니다.');
    }
    return actionError('server-error', '약속 멤버를 불러올 수 없습니다.');
  }

  const row = ((data as GetAppointmentMembersRpcRow[] | null) ?? [])[0] ?? null;
  if (!row) {
    return actionError('server-error', '약속 멤버를 불러올 수 없습니다.');
  }
  if (!row.ok) {
    if (row.error_code === 'forbidden') {
      return actionError('forbidden', '약속을 찾을 수 없거나 접근 권한이 없습니다.');
    }
    return actionError('server-error', '약속 멤버를 불러올 수 없습니다.');
  }

  const members = mapRpcMembers(row.members);
  const memberCount =
    typeof row.member_count === 'number' ? row.member_count : members.length;

  return actionSuccess({
    memberCount,
    members,
    currentUserId: user.id,
  });
}
