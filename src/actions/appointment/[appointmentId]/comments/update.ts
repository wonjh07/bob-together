'use server';

import { z } from 'zod';

import { parseOrFail, requireUser } from '@/actions/_common/guards';
import { actionError, actionSuccess } from '@/actions/_common/result';

import type {
  AppointmentCommentItem,
  UpdateAppointmentCommentResult,
} from '@/actions/appointment/types';

const updateCommentSchema = z.object({
  appointmentId: z.string().uuid('유효한 약속 ID가 아닙니다.'),
  commentId: z.string().uuid('유효한 댓글 ID가 아닙니다.'),
  content: z
    .string()
    .trim()
    .min(1, '댓글을 입력해주세요.')
    .max(200, '댓글은 200자 이내로 입력해주세요.'),
});

interface AppointmentCommentRow {
  comment_id: string;
  content: string;
  created_at: string;
  user_id: string;
  users: {
    name: string | null;
    nickname: string | null;
    profile_image: string | null;
  } | null;
}

export async function updateAppointmentCommentAction(params: {
  appointmentId: string;
  commentId: string;
  content: string;
}): Promise<UpdateAppointmentCommentResult> {
  const parsed = parseOrFail(updateCommentSchema, params);
  if (!parsed.ok) {
    return parsed;
  }

  const auth = await requireUser();
  if (!auth.ok) {
    return auth;
  }

  const { supabase, user } = auth;
  const nowIso = new Date().toISOString();
  const { appointmentId, commentId, content } = parsed.data;

  const { data: updatedData, error: updateError } = await supabase
    .from('appointment_comments')
    .update({
      content,
      edited_at: nowIso,
      updated_at: nowIso,
    })
    .eq('appointment_id', appointmentId)
    .eq('comment_id', commentId)
    .eq('user_id', user.id)
    .eq('is_deleted', false)
    .is('deleted_at', null)
    .select(
      'comment_id, content, created_at, user_id, users(name, nickname, profile_image)',
    )
    .maybeSingle();

  if (updateError || !updatedData) {
    return actionError('forbidden', '댓글 수정 권한이 없습니다.');
  }

  const row = updatedData as AppointmentCommentRow;
  const comment: AppointmentCommentItem = {
    commentId: row.comment_id,
    content: row.content,
    createdAt: row.created_at,
    userId: row.user_id,
    name: row.users?.name ?? null,
    nickname: row.users?.nickname ?? null,
    profileImage: row.users?.profile_image ?? null,
  };

  return actionSuccess({ comment });
}
