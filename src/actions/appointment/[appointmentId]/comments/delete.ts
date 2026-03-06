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

import type { DeleteAppointmentCommentResult } from '@/actions/appointment/types';

const deleteCommentSchema = z.object({
  appointmentId: z.string().uuid('유효한 약속 ID가 아닙니다.'),
  commentId: z.string().uuid('유효한 댓글 ID가 아닙니다.'),
});

export async function deleteAppointmentCommentAction(params: {
  appointmentId: string;
  commentId: string;
}): Promise<DeleteAppointmentCommentResult> {
  const state = await runServiceAction({
    serverErrorMessage: '댓글 삭제 중 오류가 발생했습니다.',
    run: async ({ requestId }) => {
      const parsed = deleteCommentSchema.safeParse(params);
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
      const { appointmentId, commentId } = parsed.data;
      const nowIso = new Date().toISOString();

      const { data: deletedData, error: deleteError } = await supabase
        .from('appointment_comments')
        .update({
          is_deleted: true,
          deleted_at: nowIso,
          updated_at: nowIso,
        })
        .eq('appointment_id', appointmentId)
        .eq('comment_id', commentId)
        .eq('user_id', user.id)
        .eq('is_deleted', false)
        .is('deleted_at', null)
        .select('comment_id')
        .maybeSingle();

      if (deleteError) {
        return createPostgrestErrorState({
          requestId,
          error: deleteError,
          permissionCodes: ['42501', '23503'],
          permissionMessage: '댓글 삭제 권한이 없습니다.',
          serverMessage: '댓글 삭제 중 오류가 발생했습니다.',
          extra: {
            appointmentId,
            commentId,
            userId: user.id,
          },
        });
      }

      if (!deletedData) {
        return createActionErrorState({
          requestId,
          code: 'permission',
          message: '댓글 삭제 권한이 없습니다.',
        });
      }

      return createActionSuccessState({
        requestId,
        data: {
          appointmentId,
          commentId,
          commentCountDelta: -1 as const,
        },
      });
    },
  });

  return toActionResult(state);
}
