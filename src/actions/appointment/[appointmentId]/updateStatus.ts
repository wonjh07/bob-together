'use server';

import { z } from 'zod';

import { parseOrFail, requireUser } from '@/actions/_common/guards';
import { actionError, actionSuccess } from '@/actions/_common/result';

import type { UpdateAppointmentStatusResult } from '../types';

const updateAppointmentStatusSchema = z.object({
  appointmentId: z.string().uuid('유효한 약속 ID가 아닙니다.'),
  status: z.enum(['pending', 'canceled']),
});

interface AppointmentStatusRow {
  ok: boolean;
  error_code: string | null;
  status: 'pending' | 'canceled' | null;
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
  const { appointmentId, status } = parsed.data;

  const updateAppointmentStatusRpc =
    'update_appointment_status_transactional' as never;
  const updateAppointmentStatusParams = {
    p_user_id: user.id,
    p_appointment_id: appointmentId,
    p_status: status,
  } as never;
  const { data, error } = await supabase.rpc(
    updateAppointmentStatusRpc,
    updateAppointmentStatusParams,
  );

  if (error) {
    if (error.code === '42501') {
      return actionError('forbidden', '약속 작성자만 상태를 변경할 수 있습니다.');
    }
    return actionError('server-error', '약속 상태 변경에 실패했습니다.');
  }

  const row = ((data as AppointmentStatusRow[] | null) ?? [])[0] ?? null;
  if (!row) {
    return actionError('server-error', '약속 상태 변경에 실패했습니다.');
  }

  if (!row.ok) {
    switch (row.error_code) {
      case 'invalid-format':
        return actionError('invalid-format', '약속 정보를 확인해주세요.');
      case 'not-found':
        return actionError('server-error', '약속 정보를 찾을 수 없습니다.');
      case 'forbidden-not-owner':
      case 'forbidden':
        return actionError('forbidden', '약속 작성자만 상태를 변경할 수 있습니다.');
      case 'forbidden-ended':
        return actionError('forbidden', '종료된 약속은 상태를 변경할 수 없습니다.');
      default:
        return actionError('server-error', '약속 상태 변경에 실패했습니다.');
    }
  }

  if (!row.status) {
    return actionError('server-error', '약속 정보를 찾을 수 없습니다.');
  }
  return actionSuccess({ status: row.status });
}
