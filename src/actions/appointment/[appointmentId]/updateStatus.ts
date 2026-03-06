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

import type { UpdateAppointmentStatusResult } from '../types';

const updateAppointmentStatusSchema = z.object({
  appointmentId: z.string().uuid('유효한 약속 ID가 아닙니다.'),
  status: z.enum(['pending', 'canceled']),
});

interface AppointmentStatusRow {
  ok: boolean;
  error_code: string | null;
  status: 'pending' | 'canceled' | null;
}

export async function updateAppointmentStatusAction(params: {
  appointmentId: string;
  status: 'pending' | 'canceled';
}): Promise<UpdateAppointmentStatusResult> {
  const state = await runServiceAction({
    serverErrorMessage: '약속 상태 변경에 실패했습니다.',
    run: async ({ requestId }) => {
      const parsed = updateAppointmentStatusSchema.safeParse(params);
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
      const { appointmentId, status } = parsed.data;

      const updateAppointmentStatusRpc =
        'update_appointment_status_transactional' as never;
      const updateAppointmentStatusParams = {
        p_user_id: user.id,
        p_appointment_id: appointmentId,
        p_status: status,
      } as never;
      const { data, error } = await supabase.rpc(
        updateAppointmentStatusRpc,
        updateAppointmentStatusParams,
      );

      if (error) {
        if (error.code === '42501') {
          return createActionErrorState({
            requestId,
            code: 'permission',
            message: '약속 작성자만 상태를 변경할 수 있습니다.',
            error,
          });
        }
        return createActionErrorState({
          requestId,
          code: 'server',
          message: '약속 상태 변경에 실패했습니다.',
          error,
        });
      }

      const row = ((data as AppointmentStatusRow[] | null) ?? [])[0] ?? null;
      if (!row) {
        return createActionErrorState({
          requestId,
          code: 'server',
          message: '약속 상태 변경에 실패했습니다.',
        });
      }

      if (!row.ok) {
        switch (row.error_code) {
          case 'invalid-format':
            return createActionErrorState({
              requestId,
              code: 'validation',
              message: '약속 정보를 확인해주세요.',
            });
          case 'not-found':
            return createActionErrorState({
              requestId,
              code: 'server',
              message: '약속 정보를 찾을 수 없습니다.',
            });
          case 'forbidden-not-owner':
          case 'forbidden':
            return createActionErrorState({
              requestId,
              code: 'permission',
              message: '약속 작성자만 상태를 변경할 수 있습니다.',
            });
          case 'forbidden-ended':
            return createActionErrorState({
              requestId,
              code: 'permission',
              message: '종료된 약속은 상태를 변경할 수 없습니다.',
            });
          default:
            return createActionErrorState({
              requestId,
              code: 'server',
              message: '약속 상태 변경에 실패했습니다.',
              error: { rpcErrorCode: row.error_code },
            });
        }
      }

      if (!row.status) {
        return createActionErrorState({
          requestId,
          code: 'server',
          message: '약속 정보를 찾을 수 없습니다.',
        });
      }

      return createActionSuccessState({
        requestId,
        data: { status: row.status },
      });
    },
  });

  return toActionResult(state);
}
