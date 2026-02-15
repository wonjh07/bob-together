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
  users:
    | {
        name: string | null;
        nickname: string | null;
        profile_image: string | null;
      }
    | null;
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
  const userId = user.id;

  const { data: appointmentData, error: appointmentError } = await supabase
    .from('appointments')
    .select('appointment_id')
    .eq('appointment_id', parsed.data)
    .maybeSingle();

  if (appointmentError || !appointmentData) {
    return actionError('forbidden', '약속을 찾을 수 없거나 접근 권한이 없습니다.');
  }

  const { data, count, error } = await supabase
    .from('appointment_members')
    .select('user_id, role, users(name, nickname, profile_image)', {
      count: 'exact',
    })
    .eq('appointment_id', parsed.data)
    .order('joined_at', { ascending: true });

  if (error) {
    return actionError('server-error', '약속 멤버를 불러올 수 없습니다.');
  }

  const rows = (data as AppointmentMemberRow[] | null) ?? [];

  const members: AppointmentMemberItem[] = rows.map((row) => ({
    userId: row.user_id,
    role: row.role,
    name: row.users?.name ?? null,
    nickname: row.users?.nickname ?? null,
    profileImage: row.users?.profile_image ?? null,
  }));

  return actionSuccess({
    memberCount: count ?? members.length,
    members,
    currentUserId: userId,
  });
}
