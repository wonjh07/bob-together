'use server';

import { z } from 'zod';

import { parseOrFail, requireUser } from '@/actions/_common/guards';
import { actionError, actionSuccess } from '@/actions/_common/result';
import { isAppointmentEndedByTime } from '@/utils/appointmentStatus';

import type { UpdateAppointmentStatusResult } from '../types';

const updateAppointmentStatusSchema = z.object({
  appointmentId: z.string().uuid('유효한 약속 ID가 아닙니다.'),
  status: z.enum(['pending', 'canceled']),
});

interface AppointmentStatusRow {
  creator_id: string;
  status: 'pending' | 'confirmed' | 'canceled';
  ends_at: string;
}

export async function updateAppointmentStatusAction(params: {
  appointmentId: string;
  status: 'pending' | 'canceled';
}): Promise<UpdateAppointmentStatusResult> {
  const parsed = parseOrFail(updateAppointmentStatusSchema, params);
  if (!parsed.ok) {
    return parsed;
  }

  const auth = await requireUser();
  if (!auth.ok) {
    return auth;
  }

  const { supabase, user } = auth;
  const userId = user.id;
  const { appointmentId, status } = parsed.data;

  const { data: appointmentData, error: appointmentError } = await supabase
    .from('appointments')
    .select('creator_id, status, ends_at')
    .eq('appointment_id', appointmentId)
    .maybeSingle<AppointmentStatusRow>();

  if (appointmentError || !appointmentData) {
    return actionError('server-error', '약속 정보를 찾을 수 없습니다.');
  }

  if (appointmentData.creator_id !== userId) {
    return actionError('forbidden', '약속 작성자만 상태를 변경할 수 있습니다.');
  }

  if (isAppointmentEndedByTime(appointmentData.ends_at)) {
    return actionError('forbidden', '종료된 약속은 상태를 변경할 수 없습니다.');
  }

  const { error: updateError } = await supabase
    .from('appointments')
    .update({ status })
    .eq('appointment_id', appointmentId);

  if (updateError) {
    return actionError('server-error', '약속 상태 변경에 실패했습니다.');
  }

  return actionSuccess({ status });
}
