'use server';

import { z } from 'zod';

import { createSupabaseServerClient } from '@/libs/supabase/server';

import type {
  AppointmentCommentItem,
  CreateAppointmentCommentResult,
} from './_shared';

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
  const parsed = createCommentSchema.safeParse(params);
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

  const userId = userData.user.id;
  const { appointmentId, content } = parsed.data;

  const { data: appointmentData, error: appointmentError } = await supabase
    .from('appointments')
    .select('appointment_id')
    .eq('appointment_id', appointmentId)
    .maybeSingle();

  if (appointmentError || !appointmentData) {
    return {
      ok: false,
      error: 'forbidden',
      message: '댓글 작성 권한이 없습니다.',
    };
  }

  const { data: insertData, error: insertError } = await supabase
    .from('appointment_comments')
    .insert({
      appointment_id: appointmentId,
      user_id: userId,
      content,
    })
    .select('comment_id')
    .single();

  if (insertError || !insertData) {
    return {
      ok: false,
      error: 'server-error',
      message: '댓글 작성에 실패했습니다.',
    };
  }

  const { data: commentData, error: commentError } = await supabase
    .from('appointment_comments')
    .select(
      'comment_id, content, created_at, user_id, users(name, nickname, profile_image)',
    )
    .eq('comment_id', insertData.comment_id)
    .maybeSingle();

  if (commentError || !commentData) {
    return {
      ok: false,
      error: 'server-error',
      message: '작성된 댓글을 불러오지 못했습니다.',
    };
  }

  const { count, error: countError } = await supabase
    .from('appointment_comments')
    .select('comment_id', { count: 'exact', head: true })
    .eq('appointment_id', appointmentId)
    .eq('is_deleted', false)
    .is('deleted_at', null);

  if (countError) {
    return {
      ok: false,
      error: 'server-error',
      message: '댓글 수를 계산하지 못했습니다.',
    };
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

  return {
    ok: true,
    data: {
      comment,
      commentCount: count ?? 0,
    },
  };
}
