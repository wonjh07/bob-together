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
  const state = await runServiceAction({
    serverErrorMessage: '초대 상태를 불러올 수 없습니다.',
    run: async ({ requestId }) => {
      const parsed = appointmentIdSchema.safeParse(appointmentId);
      if (!parsed.success) {
        return createZodValidationErrorState({
          requestId,
          error: parsed.error,
          fallbackMessage: '유효한 약속 ID가 아닙니다.',
        });
      }

      const auth = await requireUserService(requestId);
      if (!('supabase' in auth)) {
        return auth;
      }

      const { supabase, user } = auth;

      const getInvitationStateRpc =
        'get_appointment_invitation_state_transactional' as never;
      const getInvitationStateParams = {
        p_user_id: user.id,
        p_appointment_id: parsed.data,
      } as never;
      const { data, error } = await supabase.rpc(
        getInvitationStateRpc,
        getInvitationStateParams,
      );

      if (error) {
        if (error.code === '42501') {
          return createActionErrorState({
            requestId,
            code: 'permission',
            message: '약속을 찾을 수 없거나 접근 권한이 없습니다.',
            error,
          });
        }
        return createActionErrorState({
          requestId,
          code: 'server',
          message: '초대 상태를 불러올 수 없습니다.',
          error,
        });
      }

      const row =
        ((data as AppointmentInvitationStateRpcRow[] | null) ?? [])[0] ?? null;
      if (!row) {
        return createActionErrorState({
          requestId,
          code: 'server',
          message: '초대 상태를 불러올 수 없습니다.',
        });
      }

      if (!row.ok) {
        switch (row.error_code) {
          case 'forbidden':
            return createActionErrorState({
              requestId,
              code: 'permission',
              message: '약속을 찾을 수 없거나 접근 권한이 없습니다.',
            });
          case 'invalid-format':
            return createActionErrorState({
              requestId,
              code: 'validation',
              message: '유효한 약속 ID가 아닙니다.',
            });
          default:
            return createActionErrorState({
              requestId,
              code: 'server',
              message: '초대 상태를 불러올 수 없습니다.',
              error: { rpcErrorCode: row.error_code },
            });
        }
      }

      const memberIds = Array.isArray(row.member_ids)
        ? row.member_ids.filter((id): id is string => typeof id === 'string')
        : [];
      const pendingInviteeIds = Array.isArray(row.pending_invitee_ids)
        ? row.pending_invitee_ids.filter((id): id is string => typeof id === 'string')
        : [];

      return createActionSuccessState({
        requestId,
        data: {
          memberIds,
          pendingInviteeIds,
        },
      });
    },
  });

  return toActionResult(state);
}
