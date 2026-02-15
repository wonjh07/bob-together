'use server';

import { z } from 'zod';

import { parseOrFail, requireUser } from '@/actions/_common/guards';
import { actionError, actionSuccess } from '@/actions/_common/result';
import { isAppointmentEndedByTime } from '@/utils/appointmentStatus';

import type { JoinAppointmentResult } from '@/actions/appointment/types';

const appointmentIdSchema = z.string().uuid('유효한 약속 ID가 아닙니다.');

interface AppointmentStatusRow {
  status: 'pending' | 'confirmed' | 'canceled';
  ends_at: string;
}

export async function joinAppointmentAction(
  appointmentId: string,
): Promise<JoinAppointmentResult> {
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
    .select('status, ends_at')
    .eq('appointment_id', parsed.data)
    .maybeSingle<AppointmentStatusRow>();

  if (appointmentError || !appointmentData) {
    return actionError('server-error', '약속 정보를 찾을 수 없습니다.');
  }

  if (appointmentData.status === 'canceled') {
    return actionError('forbidden', '취소된 약속에는 참여할 수 없습니다.');
  }

  if (isAppointmentEndedByTime(appointmentData.ends_at)) {
    return actionError('forbidden', '종료된 약속에는 참여할 수 없습니다.');
  }

  const { data: existingMember } = await supabase
    .from('appointment_members')
    .select('user_id')
    .eq('appointment_id', parsed.data)
    .eq('user_id', userId)
    .maybeSingle();

  if (existingMember) {
    return actionError('already-member', '이미 약속 멤버입니다.');
  }

  const { error: insertError } = await supabase.from('appointment_members').insert({
    appointment_id: parsed.data,
    user_id: userId,
    role: 'member',
  });

  if (insertError) {
    return actionError('server-error', '약속 참여 처리 중 오류가 발생했습니다.');
  }

  return actionSuccess();
}
