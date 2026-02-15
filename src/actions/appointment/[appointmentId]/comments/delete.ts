'use server';

import { z } from 'zod';

import { parseOrFail, requireUser } from '@/actions/_common/guards';
import { actionError, actionSuccess } from '@/actions/_common/result';

import type { DeleteAppointmentCommentResult } from '@/actions/appointment/types';

const deleteCommentSchema = z.object({
  appointmentId: z.string().uuid('유효한 약속 ID가 아닙니다.'),
  commentId: z.string().uuid('유효한 댓글 ID가 아닙니다.'),
});

export async function deleteAppointmentCommentAction(params: {
  appointmentId: string;
  commentId: string;
}): Promise<DeleteAppointmentCommentResult> {
  const parsed = parseOrFail(deleteCommentSchema, params);
  if (!parsed.ok) {
    return parsed;
  }

  const auth = await requireUser();
  if (!auth.ok) {
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

  if (deleteError || !deletedData) {
    return actionError('forbidden', '댓글 삭제 권한이 없습니다.');
  }

  return actionSuccess({ commentId });
}
