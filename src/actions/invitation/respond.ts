'use server';

import { z } from 'zod';

import { parseOrFail, requireUser } from '@/actions/_common/guards';
import { actionError, actionSuccess } from '@/actions/_common/result';

import type { RespondToInvitationResult } from './types';

const respondToInvitationSchema = z.object({
  invitationId: z.string().uuid('유효한 초대 ID가 아닙니다.'),
  decision: z.enum(['accepted', 'rejected']),
});

interface RespondInvitationRpcRow {
  ok: boolean;
  error_code: string | null;
  invitation_id: string | null;
  invitation_type: 'group' | 'appointment' | null;
  group_id: string | null;
  appointment_id: string | null;
  status: 'pending' | 'accepted' | 'rejected' | 'canceled' | null;
}

function mapRpcBusinessError(
  code: string | null,
): {
  error: 'invitation-not-found' | 'invitation-already-responded' | 'invalid-invitation' | 'forbidden' | 'invalid-format' | 'server-error';
  message: string;
} {
  switch (code) {
    case 'invitation-not-found':
      return {
        error: 'invitation-not-found',
        message: '초대 정보를 찾을 수 없습니다.',
      };
    case 'invitation-already-responded':
      return {
        error: 'invitation-already-responded',
        message: '이미 처리된 초대입니다.',
      };
    case 'invalid-invitation':
      return {
        error: 'invalid-invitation',
        message: '유효하지 않은 약속 초대입니다.',
      };
    case 'forbidden-group-membership':
      return {
        error: 'forbidden',
        message:
          '그룹 멤버가 아니라 약속 초대를 수락할 수 없습니다. 그룹 초대를 먼저 수락해주세요.',
      };
    case 'forbidden-appointment-canceled':
      return {
        error: 'forbidden',
        message: '취소된 약속은 수락할 수 없습니다.',
      };
    case 'forbidden-appointment-ended':
      return {
        error: 'forbidden',
        message: '종료된 약속은 수락할 수 없습니다.',
      };
    case 'forbidden-join-appointment':
      return {
        error: 'forbidden',
        message: '약속에 참여할 권한이 없습니다. 그룹 가입 상태를 확인해주세요.',
      };
    case 'forbidden':
      return {
        error: 'forbidden',
        message: '초대 처리 권한이 없습니다.',
      };
    case 'invalid-format':
      return {
        error: 'invalid-format',
        message: '요청 형식이 올바르지 않습니다.',
      };
    default:
      return {
        error: 'server-error',
        message: '초대 상태를 변경하지 못했습니다.',
      };
  }
}

export async function respondToInvitationAction(input: {
  invitationId: string;
  decision: 'accepted' | 'rejected';
}): Promise<RespondToInvitationResult> {
  const parsed = parseOrFail(respondToInvitationSchema, input);
  if (!parsed.ok) {
    return parsed;
  }

  const auth = await requireUser();
  if (!auth.ok) {
    return auth;
  }

  const { supabase, user } = auth;
  const { invitationId, decision } = parsed.data;

  const respondInvitationRpc = 'respond_to_invitation_transactional' as never;
  const respondInvitationParams = {
    p_user_id: user.id,
    p_invitation_id: invitationId,
    p_decision: decision,
  } as never;
  const { data, error } = await supabase.rpc(
    respondInvitationRpc,
    respondInvitationParams,
  );

  if (error) {
    if (error.code === '42501') {
      return actionError('forbidden', '초대 처리 권한이 없습니다.');
    }
    return actionError('server-error', '초대 상태를 변경하지 못했습니다.');
  }

  const row = ((data as RespondInvitationRpcRow[] | null) ?? [])[0] ?? null;
  if (!row) {
    return actionError('server-error', '초대 상태를 변경하지 못했습니다.');
  }

  if (!row.ok) {
    const mapped = mapRpcBusinessError(row.error_code);
    return actionError(mapped.error, mapped.message);
  }

  if (
    !row.invitation_id ||
    !row.group_id ||
    !row.invitation_type ||
    !row.status
  ) {
    return actionError('server-error', '초대 상태를 변경하지 못했습니다.');
  }

  if (row.status !== 'accepted' && row.status !== 'rejected') {
    return actionError('server-error', '초대 상태를 변경하지 못했습니다.');
  }

  return actionSuccess({
    invitationId: row.invitation_id,
    status: row.status,
    type: row.invitation_type,
    groupId: row.group_id,
    appointmentId: row.appointment_id,
  });
}
