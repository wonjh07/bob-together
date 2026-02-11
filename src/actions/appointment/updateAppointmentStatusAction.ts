'use server';

import { z } from 'zod';

import { createSupabaseServerClient } from '@/libs/supabase/server';

import type { UpdateAppointmentStatusResult } from './_shared';

const updateAppointmentStatusSchema = z.object({
  appointmentId: z.string().uuid('유효한 약속 ID가 아닙니다.'),
  status: z.enum(['pending', 'confirmed', 'canceled']),
});

export async function updateAppointmentStatusAction(params: {
  appointmentId: string;
  status: 'pending' | 'confirmed' | 'canceled';
}): Promise<UpdateAppointmentStatusResult> {
  const parsed = updateAppointmentStatusSchema.safeParse(params);

  if (!parsed.success) {
    return {
      ok: false,
      error: 'invalid-format',
      message: parsed.error.issues[0]?.message || '요청 형식이 올바르지 않습니다.',
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
  const { appointmentId, status } = parsed.data;

  const { data: appointmentData, error: appointmentError } = await supabase
    .from('appointments')
    .select('creator_id')
    .eq('appointment_id', appointmentId)
    .maybeSingle();

  if (appointmentError || !appointmentData) {
    return {
      ok: false,
      error: 'server-error',
      message: '약속 정보를 찾을 수 없습니다.',
    };
  }

  if (appointmentData.creator_id !== userId) {
    return {
      ok: false,
      error: 'forbidden',
      message: '약속 작성자만 상태를 변경할 수 있습니다.',
    };
  }

  const { error: updateError } = await supabase
    .from('appointments')
    .update({ status })
    .eq('appointment_id', appointmentId);

  if (updateError) {
    return {
      ok: false,
      error: 'server-error',
      message: '약속 상태 변경에 실패했습니다.',
    };
  }

  return {
    ok: true,
    data: { status },
  };
}
