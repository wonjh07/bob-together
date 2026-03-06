'use server';

import { z } from 'zod';

import { requireUserService } from '@/actions/_common/guards';
import {
  createActionSuccessState,
  createActionErrorState,
  createPostgrestErrorState,
  createZodValidationErrorState,
  runServiceAction,
  toActionResult,
} from '@/actions/_common/service-action';

import type { SendInvitationResult } from './_shared';

interface SendGroupInvitationRpcRow {
  ok: boolean;
  error_code: string | null;
}

const sendGroupInvitationFormatSchema = z.object({
  groupId: z.string().uuid('초대 정보 형식이 올바르지 않습니다.'),
  inviteeId: z.string().uuid('초대 정보 형식이 올바르지 않습니다.'),
});

export async function sendGroupInvitationAction(
  groupId: string,
  inviteeId: string,
): Promise<SendInvitationResult> {
  const state = await runServiceAction({
    serverErrorMessage: '초대 전송 중 오류가 발생했습니다.',
    run: async ({ requestId }) => {
      if (!groupId || !inviteeId) {
        return createActionErrorState({
          requestId,
          code: 'validation',
          message: '초대 정보가 부족합니다.',
        });
      }

      const parsed = sendGroupInvitationFormatSchema.safeParse({
        groupId,
        inviteeId,
      });
      if (!parsed.success) {
        return createZodValidationErrorState({
          requestId,
          error: parsed.error,
          fallbackMessage: '초대 정보 형식이 올바르지 않습니다.',
        });
      }

      const auth = await requireUserService(requestId);
      if (!('supabase' in auth)) {
        return auth;
      }
      const { supabase, user } = auth;

      if (user.id === inviteeId) {
        return createActionErrorState({
          requestId,
          code: 'validation',
          message: '본인은 초대할 수 없습니다.',
        });
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
        return createPostgrestErrorState({
          requestId,
          error,
          permissionCodes: ['42501'],
          permissionMessage: '그룹 멤버만 초대할 수 있습니다.',
          permissionExtra: {},
          serverMessage: '초대 전송 중 오류가 발생했습니다.',
        });
      }

      const row = ((data as SendGroupInvitationRpcRow[] | null) ?? [])[0] ?? null;
      if (!row) {
        return createActionErrorState({
          requestId,
          code: 'server',
          message: '초대 전송 중 오류가 발생했습니다.',
        });
      }

      if (!row.ok) {
        switch (row.error_code) {
          case 'invalid-format':
            return createActionErrorState({
              requestId,
              code: 'validation',
              message: '초대 정보 형식이 올바르지 않습니다.',
            });
          case 'forbidden':
            return createActionErrorState({
              requestId,
              code: 'permission',
              message: '그룹 멤버만 초대할 수 있습니다.',
            });
          case 'already-member':
            return createActionErrorState({
              requestId,
              code: 'conflict',
              message: '이미 그룹에 가입된 사용자입니다.',
              reason: 'already_member',
            });
          case 'invite-already-sent':
            return createActionErrorState({
              requestId,
              code: 'conflict',
              message: '이미 초대가 발송되었습니다.',
              reason: 'already_invited',
            });
          default:
            return createActionErrorState({
              requestId,
              code: 'server',
              message: '초대 전송 중 오류가 발생했습니다.',
              error: { rpcErrorCode: row.error_code },
            });
        }
      }

      return createActionSuccessState({ requestId });
    },
  });

  return toActionResult(state);
}
