'use server';

import { z } from 'zod';

import { requireUserService } from '@/actions/_common/guards';
import {
  createActionSuccessState,
  createActionErrorState,
  runServiceAction,
  toActionResult,
  createZodValidationErrorState,
} from '@/actions/_common/service-action';

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
  code: 'validation' | 'conflict' | 'not_found' | 'permission' | 'server';
  message: string;
} {
  switch (code) {
    case 'invitation-not-found':
      return {
        code: 'not_found',
        message: '초대 정보를 찾을 수 없습니다.',
      };
    case 'invitation-already-responded':
      return {
        code: 'conflict',
        message: '이미 처리된 초대입니다.',
      };
    case 'invalid-invitation':
      return {
        code: 'validation',
        message: '유효하지 않은 약속 초대입니다.',
      };
    case 'forbidden-group-membership':
      return {
        code: 'permission',
        message:
          '그룹 멤버가 아니라 약속 초대를 수락할 수 없습니다. 그룹 초대를 먼저 수락해주세요.',
      };
    case 'forbidden-appointment-canceled':
      return {
        code: 'permission',
        message: '취소된 약속은 수락할 수 없습니다.',
      };
    case 'forbidden-appointment-ended':
      return {
        code: 'permission',
        message: '종료된 약속은 수락할 수 없습니다.',
      };
    case 'forbidden-join-appointment':
      return {
        code: 'permission',
        message: '약속에 참여할 권한이 없습니다. 그룹 가입 상태를 확인해주세요.',
      };
    case 'forbidden':
      return {
        code: 'permission',
        message: '초대 처리 권한이 없습니다.',
      };
    case 'invalid-format':
      return {
        code: 'validation',
        message: '요청 형식이 올바르지 않습니다.',
      };
    default:
      return {
        code: 'server',
        message: '초대 상태를 변경하지 못했습니다.',
      };
  }
}

export async function respondToInvitationAction(input: {
  invitationId: string;
  decision: 'accepted' | 'rejected';
}): Promise<RespondToInvitationResult> {
  const state = await runServiceAction({
    serverErrorMessage: '초대 상태를 변경하지 못했습니다.',
    run: async ({ requestId }) => {
      const parsed = respondToInvitationSchema.safeParse(input);
      if (!parsed.success) {
        return createZodValidationErrorState({
          requestId,
          error: parsed.error,
          fallbackMessage: '요청 형식이 올바르지 않습니다.',
        });
      }

      const auth = await requireUserService(requestId);
      if (!('supabase' in auth)) {
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
          return createActionErrorState({
            requestId,
            code: 'permission',
            message: '초대 처리 권한이 없습니다.',
          });
        }
        return createActionErrorState({
          requestId,
          code: 'server',
          message: '초대 상태를 변경하지 못했습니다.',
          error,
        });
      }

      const row = ((data as RespondInvitationRpcRow[] | null) ?? [])[0] ?? null;
      if (!row) {
        return createActionErrorState({
          requestId,
          code: 'server',
          message: '초대 상태를 변경하지 못했습니다.',
        });
      }

      if (!row.ok) {
        const mapped = mapRpcBusinessError(row.error_code);
        return createActionErrorState({
          requestId,
          code: mapped.code,
          message: mapped.message,
        });
      }

      if (
        !row.invitation_id
        || !row.group_id
        || !row.invitation_type
        || !row.status
      ) {
        return createActionErrorState({
          requestId,
          code: 'server',
          message: '초대 상태를 변경하지 못했습니다.',
        });
      }

      if (row.status !== 'accepted' && row.status !== 'rejected') {
        return createActionErrorState({
          requestId,
          code: 'server',
          message: '초대 상태를 변경하지 못했습니다.',
        });
      }

      return createActionSuccessState({
        requestId,
        data: {
          invitationId: row.invitation_id,
          status: row.status,
          type: row.invitation_type,
          groupId: row.group_id,
          appointmentId: row.appointment_id,
        },
      });
    },
  });

  return toActionResult(state);
}
