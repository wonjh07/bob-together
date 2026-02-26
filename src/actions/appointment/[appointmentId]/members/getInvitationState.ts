'use server';

import { z } from 'zod';

import { parseOrFail, requireUser } from '@/actions/_common/guards';
import { actionError, actionSuccess } from '@/actions/_common/result';

import type { GetAppointmentInvitationStateResult } from '@/actions/appointment/types';

const appointmentIdSchema = z.string().uuid('유효한 약속 ID가 아닙니다.');

interface AppointmentInvitationStateRpcRow {
  ok: boolean;
  error_code: string | null;
  member_ids: string[] | null;
  pending_invitee_ids: string[] | null;
}

export async function getAppointmentInvitationStateAction(
  appointmentId: string,
): Promise<GetAppointmentInvitationStateResult> {
  const parsed = parseOrFail(appointmentIdSchema, appointmentId);
  if (!parsed.ok) {
    return parsed;
  }

  const auth = await requireUser();
  if (!auth.ok) {
    return auth;
  }

  const { supabase } = auth;

  const getInvitationStateRpc =
    'get_appointment_invitation_state_transactional' as never;
  const getInvitationStateParams = {
    p_user_id: auth.user.id,
    p_appointment_id: parsed.data,
  } as never;
  const { data, error } = await supabase.rpc(
    getInvitationStateRpc,
    getInvitationStateParams,
  );

  if (error) {
    if (error.code === '42501') {
      return actionError('forbidden', '약속을 찾을 수 없거나 접근 권한이 없습니다.');
    }
    return actionError('server-error', '초대 상태를 불러올 수 없습니다.');
  }

  const row =
    ((data as AppointmentInvitationStateRpcRow[] | null) ?? [])[0] ?? null;
  if (!row) {
    return actionError('server-error', '초대 상태를 불러올 수 없습니다.');
  }

  if (!row.ok) {
    switch (row.error_code) {
      case 'forbidden':
        return actionError('forbidden', '약속을 찾을 수 없거나 접근 권한이 없습니다.');
      case 'invalid-format':
        return actionError('invalid-format', '유효한 약속 ID가 아닙니다.');
      default:
        return actionError('server-error', '초대 상태를 불러올 수 없습니다.');
    }
  }

  const memberIds = Array.isArray(row.member_ids)
    ? row.member_ids.filter((id): id is string => typeof id === 'string')
    : [];
  const pendingInviteeIds = Array.isArray(row.pending_invitee_ids)
    ? row.pending_invitee_ids.filter((id): id is string => typeof id === 'string')
    : [];

  return actionSuccess({
    memberIds,
    pendingInviteeIds,
  });
}
