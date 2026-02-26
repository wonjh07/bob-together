'use server';

import { requireUser } from '@/actions/_common/guards';
import { actionError, actionSuccess } from '@/actions/_common/result';

import type { SendInvitationResult } from './_shared';

interface SendGroupInvitationRpcRow {
  ok: boolean;
  error_code: string | null;
}

export async function sendGroupInvitationAction(
  groupId: string,
  inviteeId: string,
): Promise<SendInvitationResult> {
  if (!groupId || !inviteeId) {
    return actionError('invalid-format', '초대 정보가 부족합니다.');
  }

  const auth = await requireUser();
  if (!auth.ok) {
    return auth;
  }
  const { supabase, user } = auth;

  if (user.id === inviteeId) {
    return actionError('invalid-format', '본인은 초대할 수 없습니다.');
  }

  const sendGroupInviteRpc = 'send_group_invitation_transactional' as never;
  const sendGroupInviteRpcParams = {
    p_inviter_id: user.id,
    p_group_id: groupId,
    p_invitee_id: inviteeId,
  } as never;
  const { data, error } = await supabase.rpc(
    sendGroupInviteRpc,
    sendGroupInviteRpcParams,
  );

  if (error) {
    if (error.code === '42501') {
      return actionError('forbidden', '그룹 멤버만 초대할 수 있습니다.');
    }
    return actionError('server-error', '초대 전송 중 오류가 발생했습니다.');
  }

  const row = ((data as SendGroupInvitationRpcRow[] | null) ?? [])[0] ?? null;
  if (!row) {
    return actionError('server-error', '초대 전송 중 오류가 발생했습니다.');
  }

  if (!row.ok) {
    switch (row.error_code) {
      case 'invalid-format':
        return actionError('invalid-format', '본인은 초대할 수 없습니다.');
      case 'forbidden':
        return actionError('forbidden', '그룹 멤버만 초대할 수 있습니다.');
      case 'already-member':
        return actionError('already-member', '이미 그룹에 가입된 사용자입니다.');
      case 'invite-already-sent':
        return actionError('invite-already-sent', '이미 초대가 발송되었습니다.');
      default:
        return actionError('server-error', '초대 전송 중 오류가 발생했습니다.');
    }
  }

  return actionSuccess();
}
