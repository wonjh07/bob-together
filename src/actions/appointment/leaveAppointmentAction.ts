'use server';

import { z } from 'zod';

import { createSupabaseServerClient } from '@/libs/supabase/server';

import type { LeaveAppointmentResult } from './_shared';

const appointmentIdSchema = z.string().uuid('유효한 약속 ID가 아닙니다.');

export async function leaveAppointmentAction(
  appointmentId: string,
): Promise<LeaveAppointmentResult> {
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
    .select('creator_id')
    .eq('appointment_id', parsed.data)
    .maybeSingle();

  if (appointmentError || !appointmentData) {
    return {
      ok: false,
      error: 'server-error',
      message: '약속 정보를 찾을 수 없습니다.',
    };
  }

  if (appointmentData.creator_id === userId) {
    return {
      ok: false,
      error: 'forbidden',
      message: '약속 작성자는 나가기할 수 없습니다.',
    };
  }

  const { error: deleteError } = await supabase
    .from('appointment_members')
    .delete()
    .eq('appointment_id', parsed.data)
    .eq('user_id', userId);

  if (deleteError) {
    return {
      ok: false,
      error: 'server-error',
      message: '약속 나가기 처리 중 오류가 발생했습니다.',
    };
  }

  return { ok: true };
}
