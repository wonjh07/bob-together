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
  code: 'validation' | 'permission' | 'conflict' | 'not_found' | 'server';
  message: string;
  reason?: string;
} {
  switch (code) {
    case 'invalid-format':
      return {
        code: 'validation',
        message: '본인은 초대할 수 없습니다.',
      };
    case 'forbidden-appointment-canceled':
      return {
        code: 'permission',
        message: '취소된 약속은 초대할 수 없습니다.',
      };
    case 'forbidden-appointment-ended':
      return {
        code: 'permission',
        message: '종료된 약속은 초대할 수 없습니다.',
      };
    case 'forbidden-not-appointment-member':
      return {
        code: 'permission',
        message: '약속 멤버만 초대할 수 있습니다.',
      };
    case 'forbidden-invitee-not-group-member':
      return {
        code: 'permission',
        message: '해당 사용자는 그룹 멤버가 아니어서 약속 초대를 보낼 수 없습니다.',
      };
    case 'already-member':
      return {
        code: 'conflict',
        message: '이미 약속에 참여한 사용자입니다.',
        reason: 'already_member',
      };
    case 'invite-already-sent':
      return {
        code: 'conflict',
        message: '이미 초대가 발송되었습니다.',
        reason: 'already_invited',
      };
    case 'appointment-not-found':
      return {
        code: 'not_found',
        message: '약속 정보를 찾을 수 없습니다.',
      };
    case 'forbidden':
      return {
        code: 'permission',
        message: '초대 권한이 없습니다.',
      };
    default:
      return {
        code: 'server',
        message: '초대 전송 중 오류가 발생했습니다.',
      };
  }
}

export async function sendAppointmentInvitationAction(
  appointmentId: string,
  inviteeId: string,
): Promise<SendAppointmentInvitationResult> {
  const state = await runServiceAction({
    serverErrorMessage: '초대 전송 중 오류가 발생했습니다.',
    run: async ({ requestId }) => {
      const parsed = sendAppointmentInvitationSchema.safeParse({
        appointmentId,
        inviteeId,
      });

      if (!parsed.success) {
        return createZodValidationErrorState({
          requestId,
          error: parsed.error,
          fallbackMessage: '입력값이 올바르지 않습니다.',
        });
      }

      const auth = await requireUserService(requestId);
      if (!('supabase' in auth)) {
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
          return createActionErrorState({
            requestId,
            code: 'permission',
            message: '초대 권한이 없습니다.',
            error,
          });
        }
        return createActionErrorState({
          requestId,
          code: 'server',
          message: '초대 전송 중 오류가 발생했습니다.',
          error,
        });
      }

      const row = ((data as SendAppointmentInvitationRpcRow[] | null) ?? [])[0] ?? null;
      if (!row) {
        return createActionErrorState({
          requestId,
          code: 'server',
          message: '초대 전송 중 오류가 발생했습니다.',
        });
      }

      if (!row.ok) {
        const mapped = mapRpcBusinessError(row.error_code);
        return createActionErrorState({
          requestId,
          code: mapped.code,
          message: mapped.message,
          reason: mapped.reason,
          error:
            mapped.code === 'server'
              ? { rpcErrorCode: row.error_code }
              : undefined,
        });
      }

      return createActionSuccessState({ requestId });
    },
  });

  return toActionResult(state);
}
