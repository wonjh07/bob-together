'use server';

import { z } from 'zod';

import { createSupabaseServerClient } from '@/libs/supabase/server';

import type {
  AppointmentCommentItem,
  UpdateAppointmentCommentResult,
} from './_shared';

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
  const parsed = updateCommentSchema.safeParse(params);
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
    .eq('user_id', userData.user.id)
    .eq('is_deleted', false)
    .is('deleted_at', null)
    .select(
      'comment_id, content, created_at, user_id, users(name, nickname, profile_image)',
    )
    .maybeSingle();

  if (updateError || !updatedData) {
    return {
      ok: false,
      error: 'forbidden',
      message: '댓글 수정 권한이 없습니다.',
    };
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

  return {
    ok: true,
    data: {
      comment,
    },
  };
}
