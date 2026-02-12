'use server';

import { z } from 'zod';

import { createSupabaseServerClient } from '@/libs/supabase/server';

import type { DeleteAppointmentCommentResult } from './_shared';

const deleteCommentSchema = z.object({
  appointmentId: z.string().uuid('유효한 약속 ID가 아닙니다.'),
  commentId: z.string().uuid('유효한 댓글 ID가 아닙니다.'),
});

export async function deleteAppointmentCommentAction(params: {
  appointmentId: string;
  commentId: string;
}): Promise<DeleteAppointmentCommentResult> {
  const parsed = deleteCommentSchema.safeParse(params);
  if (!parsed.success) {
    return {
      ok: false,
      error: 'invalid-format',
      message:
        parsed.error.issues[0]?.message || '요청 형식이 올바르지 않습니다.',
    };
  }

  const supabase = createSupabaseServerClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    return {
      ok: false,
      error: 'unauthorized',
      message: '로그인이 필요합니다.',
    };
  }

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
    .eq('user_id', userData.user.id)
    .eq('is_deleted', false)
    .is('deleted_at', null)
    .select('comment_id')
    .maybeSingle();

  if (deleteError || !deletedData) {
    return {
      ok: false,
      error: 'forbidden',
      message: '댓글 삭제 권한이 없습니다.',
    };
  }

  return {
    ok: true,
    data: {
      commentId,
    },
  };
}
