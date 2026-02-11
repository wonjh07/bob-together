'use server';

import { z } from 'zod';

import { createSupabaseServerClient } from '@/libs/supabase/server';

import type { JoinAppointmentResult } from './_shared';

const appointmentIdSchema = z.string().uuid('유효한 약속 ID가 아닙니다.');

export async function joinAppointmentAction(
  appointmentId: string,
): Promise<JoinAppointmentResult> {
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

  const { data: existingMember } = await supabase
    .from('appointment_members')
    .select('user_id')
    .eq('appointment_id', parsed.data)
    .eq('user_id', userId)
    .maybeSingle();

  if (existingMember) {
    return {
      ok: false,
      error: 'already-member',
      message: '이미 약속 멤버입니다.',
    };
  }

  const { error: insertError } = await supabase.from('appointment_members').insert({
    appointment_id: parsed.data,
    user_id: userId,
    role: 'member',
  });

  if (insertError) {
    return {
      ok: false,
      error: 'server-error',
      message: '약속 참여 처리 중 오류가 발생했습니다.',
    };
  }

  return { ok: true };
}
