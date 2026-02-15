'use server';

import { z } from 'zod';

import { parseOrFail, requireUser } from '@/actions/_common/guards';
import { actionError, actionSuccess } from '@/actions/_common/result';

import type {
  AppointmentCommentItem,
  CreateAppointmentCommentResult,
} from '@/actions/appointment/types';

const createCommentSchema = z.object({
  appointmentId: z.string().uuid('유효한 약속 ID가 아닙니다.'),
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

export async function createAppointmentCommentAction(params: {
  appointmentId: string;
  content: string;
}): Promise<CreateAppointmentCommentResult> {
  const parsed = parseOrFail(createCommentSchema, params);
  if (!parsed.ok) {
    return parsed;
  }

  const auth = await requireUser();
  if (!auth.ok) {
    return auth;
  }

  const { supabase, user } = auth;
  const userId = user.id;
  const { appointmentId, content } = parsed.data;

  const { data: commentData, error: insertError } = await supabase
    .from('appointment_comments')
    .insert({
      appointment_id: appointmentId,
      user_id: userId,
      content,
    })
    .select(
      'comment_id, content, created_at, user_id, users(name, nickname, profile_image)',
    )
    .single();

  if (insertError || !commentData) {
    return actionError('forbidden', '댓글 작성 권한이 없습니다.');
  }

  const row = commentData as AppointmentCommentRow;
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
