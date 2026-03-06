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

import type { DeleteMyReviewResult } from '../types';

const deleteMyReviewSchema = z.object({
  appointmentId: z.string().uuid('유효한 약속 정보가 필요합니다.'),
});

interface DeleteMyReviewRpcRow {
  ok: boolean;
  error_code: string | null;
  appointment_id: string | null;
}

export async function deleteMyReviewAction(params: {
  appointmentId: string;
}): Promise<DeleteMyReviewResult> {
  const state = await runServiceAction({
    serverErrorMessage: '리뷰 삭제에 실패했습니다.',
    run: async ({ requestId }) => {
      const parsed = deleteMyReviewSchema.safeParse(params);
      if (!parsed.success) {
        return createZodValidationErrorState({
          requestId,
          error: parsed.error,
          fallbackMessage: '유효한 약속 정보가 필요합니다.',
        });
      }

      const auth = await requireUserService(requestId);
      if (!('supabase' in auth)) {
        return auth;
      }

      const { supabase, user } = auth;
      const { appointmentId } = parsed.data;
      const deleteMyReviewRpc = 'delete_my_review_transactional' as never;
      const deleteMyReviewParams = {
        p_user_id: user.id,
        p_appointment_id: appointmentId,
        p_edited_at: new Date().toISOString(),
      } as never;
      const { data, error } = await supabase.rpc(
        deleteMyReviewRpc,
        deleteMyReviewParams,
      );

      if (error) {
        return createPostgrestErrorState({
          requestId,
          error,
          permissionCodes: ['42501'],
          permissionMessage: '리뷰 삭제 권한이 없습니다.',
          serverMessage: '리뷰 삭제에 실패했습니다.',
        });
      }

      const row = ((data as DeleteMyReviewRpcRow[] | null) ?? [])[0] ?? null;
      if (!row) {
        return createActionErrorState({
          requestId,
          code: 'server',
          message: '리뷰 삭제에 실패했습니다.',
        });
      }

      if (!row.ok) {
        switch (row.error_code) {
          case 'invalid-format':
            return createActionErrorState({
              requestId,
              code: 'validation',
              message: '유효한 약속 정보가 필요합니다.',
            });
          case 'forbidden':
            return createActionErrorState({
              requestId,
              code: 'permission',
              message: '리뷰 삭제 권한이 없습니다.',
            });
          case 'server-error-read':
            return createActionErrorState({
              requestId,
              code: 'server',
              message: '리뷰 정보를 확인하지 못했습니다.',
            });
          case 'server-error-update':
            return createActionErrorState({
              requestId,
              code: 'server',
              message: '리뷰 삭제에 실패했습니다.',
            });
          default:
            return createActionErrorState({
              requestId,
              code: 'server',
              message: '리뷰 삭제에 실패했습니다.',
              error: { rpcErrorCode: row.error_code },
            });
        }
      }

      return createActionSuccessState({
        requestId,
        data: {
          appointmentId: row.appointment_id ?? appointmentId,
        },
      });
    },
  });

  return toActionResult(state);
}
