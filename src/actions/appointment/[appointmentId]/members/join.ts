'use server';

import { z } from 'zod';

import { parseOrFail, requireUser } from '@/actions/_common/guards';
import { actionError, actionSuccess } from '@/actions/_common/result';

import type { JoinAppointmentResult } from '@/actions/appointment/types';

const appointmentIdSchema = z.string().uuid('유효한 약속 ID가 아닙니다.');

interface JoinAppointmentRpcRow {
  ok: boolean;
  error_code: string | null;
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
  const joinAppointmentRpc = 'join_appointment_transactional' as never;
  const joinAppointmentParams = {
    p_user_id: user.id,
    p_appointment_id: parsed.data,
  } as never;
  const { data, error } = await supabase.rpc(joinAppointmentRpc, joinAppointmentParams);

  if (error) {
    if (error.code === '42501') {
      return actionError('forbidden', '약속 참여 권한이 없습니다.');
    }
    return actionError('server-error', '약속 참여 처리 중 오류가 발생했습니다.');
  }

  const row = ((data as JoinAppointmentRpcRow[] | null) ?? [])[0] ?? null;
  if (!row) {
    return actionError('server-error', '약속 참여 처리 중 오류가 발생했습니다.');
  }

  if (!row.ok) {
    switch (row.error_code) {
      case 'already-member':
        return actionError('already-member', '이미 약속 멤버입니다.');
      case 'forbidden-appointment-canceled':
        return actionError('forbidden', '취소된 약속에는 참여할 수 없습니다.');
      case 'forbidden-appointment-ended':
        return actionError('forbidden', '종료된 약속에는 참여할 수 없습니다.');
      case 'forbidden-not-group-member':
      case 'forbidden':
        return actionError('forbidden', '약속 참여 권한이 없습니다.');
      case 'appointment-not-found':
        return actionError('server-error', '약속 정보를 찾을 수 없습니다.');
      default:
        return actionError('server-error', '약속 참여 처리 중 오류가 발생했습니다.');
    }
  }

  return actionSuccess();
}
