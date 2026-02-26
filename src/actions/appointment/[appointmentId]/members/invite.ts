'use server';

import { z } from 'zod';

import { parseOrFail, requireUser } from '@/actions/_common/guards';
import { actionError, actionSuccess } from '@/actions/_common/result';

import type { SendAppointmentInvitationResult } from '@/actions/appointment/types';

const sendAppointmentInvitationSchema = z.object({
  appointmentId: z.string().uuid('유효한 약속 ID가 아닙니다.'),
  inviteeId: z.string().uuid('유효한 사용자 ID가 아닙니다.'),
});

interface SendAppointmentInvitationRpcRow {
  ok: boolean;
  error_code: string | null;
}

function mapRpcBusinessError(
  code: string | null,
): {
  error: 'invalid-format' | 'forbidden' | 'already-member' | 'invite-already-sent' | 'server-error';
  message: string;
} {
  switch (code) {
    case 'invalid-format':
      return {
        error: 'invalid-format',
        message: '본인은 초대할 수 없습니다.',
      };
    case 'forbidden-appointment-canceled':
      return {
        error: 'forbidden',
        message: '취소된 약속은 초대할 수 없습니다.',
      };
    case 'forbidden-appointment-ended':
      return {
        error: 'forbidden',
        message: '종료된 약속은 초대할 수 없습니다.',
      };
    case 'forbidden-not-appointment-member':
      return {
        error: 'forbidden',
        message: '약속 멤버만 초대할 수 있습니다.',
      };
    case 'forbidden-invitee-not-group-member':
      return {
        error: 'forbidden',
        message: '해당 사용자는 그룹 멤버가 아니어서 약속 초대를 보낼 수 없습니다.',
      };
    case 'already-member':
      return {
        error: 'already-member',
        message: '이미 약속에 참여한 사용자입니다.',
      };
    case 'invite-already-sent':
      return {
        error: 'invite-already-sent',
        message: '이미 초대가 발송되었습니다.',
      };
    case 'appointment-not-found':
      return {
        error: 'server-error',
        message: '약속 정보를 찾을 수 없습니다.',
      };
    case 'forbidden':
      return {
        error: 'forbidden',
        message: '초대 권한이 없습니다.',
      };
    default:
      return {
        error: 'server-error',
        message: '초대 전송 중 오류가 발생했습니다.',
      };
  }
}

export async function sendAppointmentInvitationAction(
  appointmentId: string,
  inviteeId: string,
): Promise<SendAppointmentInvitationResult> {
  const parsed = parseOrFail(sendAppointmentInvitationSchema, {
    appointmentId,
    inviteeId,
  });
  if (!parsed.ok) {
    return parsed;
  }

  const auth = await requireUser();
  if (!auth.ok) {
    return auth;
  }
  const { supabase, user } = auth;
  const { appointmentId: parsedAppointmentId, inviteeId: parsedInviteeId } =
    parsed.data;
  const sendInviteRpc = 'send_appointment_invitation_transactional' as never;
  const sendInviteParams = {
    p_inviter_id: user.id,
    p_appointment_id: parsedAppointmentId,
    p_invitee_id: parsedInviteeId,
  } as never;
  const { data, error } = await supabase.rpc(sendInviteRpc, sendInviteParams);

  if (error) {
    if (error.code === '42501') {
      return actionError('forbidden', '초대 권한이 없습니다.');
    }
    return actionError('server-error', '초대 전송 중 오류가 발생했습니다.');
  }

  const row = ((data as SendAppointmentInvitationRpcRow[] | null) ?? [])[0] ?? null;
  if (!row) {
    return actionError('server-error', '초대 전송 중 오류가 발생했습니다.');
  }

  if (!row.ok) {
    const mapped = mapRpcBusinessError(row.error_code);
    return actionError(mapped.error, mapped.message);
  }

  return actionSuccess();
}
