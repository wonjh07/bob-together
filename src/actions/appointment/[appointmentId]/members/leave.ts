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

import type { LeaveAppointmentResult } from '@/actions/appointment/types';

const appointmentIdSchema = z.string().uuid('유효한 약속 ID가 아닙니다.');

interface LeaveAppointmentRpcRow {
  ok: boolean;
  error_code: string | null;
}

export async function leaveAppointmentAction(
  appointmentId: string,
): Promise<LeaveAppointmentResult> {
  const state = await runServiceAction({
    serverErrorMessage: '약속 나가기 처리 중 오류가 발생했습니다.',
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
      const leaveAppointmentRpc = 'leave_appointment_transactional' as never;
      const leaveAppointmentParams = {
        p_user_id: user.id,
        p_appointment_id: parsed.data,
      } as never;
      const { data, error } = await supabase.rpc(
        leaveAppointmentRpc,
        leaveAppointmentParams,
      );

      if (error) {
        if (error.code === '42501') {
          return createActionErrorState({
            requestId,
            code: 'permission',
            message: '약속 나가기 권한이 없습니다.',
            error,
          });
        }
        return createActionErrorState({
          requestId,
          code: 'server',
          message: '약속 나가기 처리 중 오류가 발생했습니다.',
          error,
        });
      }

      const row = ((data as LeaveAppointmentRpcRow[] | null) ?? [])[0] ?? null;
      if (!row) {
        return createActionErrorState({
          requestId,
          code: 'server',
          message: '약속 나가기 처리 중 오류가 발생했습니다.',
        });
      }

      if (!row.ok) {
        switch (row.error_code) {
          case 'invalid-format':
            return createActionErrorState({
              requestId,
              code: 'validation',
              message: '유효한 약속 ID가 아닙니다.',
            });
          case 'appointment-not-found':
            return createActionErrorState({
              requestId,
              code: 'not_found',
              message: '약속 정보를 찾을 수 없습니다.',
            });
          case 'forbidden-owner':
            return createActionErrorState({
              requestId,
              code: 'permission',
              message: '약속 작성자는 나가기할 수 없습니다.',
            });
          case 'forbidden-appointment-canceled':
            return createActionErrorState({
              requestId,
              code: 'permission',
              message: '취소된 약속에서는 나갈 수 없습니다.',
            });
          case 'forbidden-appointment-ended':
            return createActionErrorState({
              requestId,
              code: 'permission',
              message: '종료된 약속에서는 나갈 수 없습니다.',
            });
          case 'forbidden':
            return createActionErrorState({
              requestId,
              code: 'permission',
              message: '약속 나가기 권한이 없습니다.',
            });
          default:
            return createActionErrorState({
              requestId,
              code: 'server',
              message: '약속 나가기 처리 중 오류가 발생했습니다.',
              error: { rpcErrorCode: row.error_code },
            });
        }
      }

      return createActionSuccessState({ requestId });
    },
  });

  return toActionResult(state);
}
