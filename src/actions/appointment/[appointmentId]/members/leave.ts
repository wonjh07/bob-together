'use server';

import { z } from 'zod';

import { parseOrFail, requireUser } from '@/actions/_common/guards';
import { actionError, actionSuccess } from '@/actions/_common/result';
import { isAppointmentEndedByTime } from '@/utils/appointmentStatus';

import type { LeaveAppointmentResult } from '@/actions/appointment/types';

const appointmentIdSchema = z.string().uuid('유효한 약속 ID가 아닙니다.');

interface AppointmentStatusRow {
  creator_id: string;
  status: 'pending' | 'confirmed' | 'canceled';
  ends_at: string;
}

export async function leaveAppointmentAction(
  appointmentId: string,
): Promise<LeaveAppointmentResult> {
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
    .select('creator_id, status, ends_at')
    .eq('appointment_id', parsed.data)
    .maybeSingle<AppointmentStatusRow>();

  if (appointmentError || !appointmentData) {
    return actionError('server-error', '약속 정보를 찾을 수 없습니다.');
  }

  if (appointmentData.creator_id === userId) {
    return actionError('forbidden', '약속 작성자는 나가기할 수 없습니다.');
  }

  if (appointmentData.status === 'canceled') {
    return actionError('forbidden', '취소된 약속에서는 나갈 수 없습니다.');
  }

  if (isAppointmentEndedByTime(appointmentData.ends_at)) {
    return actionError('forbidden', '종료된 약속에서는 나갈 수 없습니다.');
  }

  const { error: deleteError } = await supabase
    .from('appointment_members')
    .delete()
    .eq('appointment_id', parsed.data)
    .eq('user_id', userId);

  if (deleteError) {
    return actionError('server-error', '약속 나가기 처리 중 오류가 발생했습니다.');
  }

  return actionSuccess();
}
