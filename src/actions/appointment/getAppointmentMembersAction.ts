'use server';

import { z } from 'zod';

import {
  createSupabaseServerClient,
} from '@/libs/supabase/server';

import type {
  AppointmentMemberItem,
  GetAppointmentMembersResult,
} from './_shared';

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
  const parsed = appointmentIdSchema.safeParse(appointmentId);
  if (!parsed.success) {
    return {
      ok: false,
      error: 'invalid-format',
      message: parsed.error.issues[0]?.message || '유효한 약속 ID가 아닙니다.',
    };
  }

  const supabase = createSupabaseServerClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    return {
      ok: false,
      error: 'unauthorized',
      message: '로그인이 필요합니다.',
    };
  }

  const userId = userData.user.id;

  const { data: appointmentData, error: appointmentError } = await supabase
    .from('appointments')
    .select('appointment_id')
    .eq('appointment_id', parsed.data)
    .maybeSingle();

  if (appointmentError || !appointmentData) {
    return {
      ok: false,
      error: 'forbidden',
      message: '약속을 찾을 수 없거나 접근 권한이 없습니다.',
    };
  }

  const { data, error } = await supabase
    .from('appointment_members')
    .select('user_id, role, users(name, nickname, profile_image)')
    .eq('appointment_id', parsed.data)
    .order('joined_at', { ascending: true });

  if (error) {
    return {
      ok: false,
      error: 'server-error',
      message: '약속 멤버를 불러올 수 없습니다.',
    };
  }

  const rows = (data as AppointmentMemberRow[] | null) ?? [];

  const members: AppointmentMemberItem[] = rows.map((row) => ({
    userId: row.user_id,
    role: row.role,
    name: row.users?.name ?? null,
    nickname: row.users?.nickname ?? null,
    profileImage: row.users?.profile_image ?? null,
  }));

  return {
    ok: true,
    data: {
      memberCount: members.length,
      members,
      currentUserId: userId,
    },
  };
}
