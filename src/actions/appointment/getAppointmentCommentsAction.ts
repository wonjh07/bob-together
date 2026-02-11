'use server';

import { z } from 'zod';

import { createSupabaseServerClient } from '@/libs/supabase/server';

import type {
  AppointmentCommentItem,
  GetAppointmentCommentsResult,
} from './_shared';

const appointmentIdSchema = z.string().uuid('유효한 약속 ID가 아닙니다.');

interface AppointmentCommentRow {
  comment_id: string;
  content: string;
  created_at: string;
  user_id: string;
  users:
    | {
        name: string | null;
        nickname: string | null;
        profile_image: string | null;
      }
    | null;
}

export async function getAppointmentCommentsAction(
  appointmentId: string,
): Promise<GetAppointmentCommentsResult> {
  const parsed = appointmentIdSchema.safeParse(appointmentId);
  if (!parsed.success) {
    return {
      ok: false,
      error: 'invalid-format',
      message: parsed.error.issues[0]?.message || '유효한 약속 ID가 아닙니다.',
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

  const { data: appointmentData, error: appointmentError } = await supabase
    .from('appointments')
    .select('appointment_id')
    .eq('appointment_id', parsed.data)
    .maybeSingle();

  if (appointmentError || !appointmentData) {
    return {
      ok: false,
      error: 'forbidden',
      message: '댓글을 볼 권한이 없습니다.',
    };
  }

  const { data, count, error } = await supabase
    .from('appointment_comments')
    .select('comment_id, content, created_at, user_id, users(name, nickname, profile_image)', {
      count: 'exact',
    })
    .eq('appointment_id', parsed.data)
    .eq('is_deleted', false)
    .is('deleted_at', null)
    .order('created_at', { ascending: true });

  if (error) {
    return {
      ok: false,
      error: 'server-error',
      message: '댓글을 불러오지 못했습니다.',
    };
  }

  const rows = (data as AppointmentCommentRow[] | null) ?? [];
  const comments: AppointmentCommentItem[] = rows.map((row) => ({
    commentId: row.comment_id,
    content: row.content,
    createdAt: row.created_at,
    userId: row.user_id,
    name: row.users?.name ?? null,
    nickname: row.users?.nickname ?? null,
    profileImage: row.users?.profile_image ?? null,
  }));

  return {
    ok: true,
    data: {
      commentCount: count ?? comments.length,
      comments,
      currentUserId: userId,
    },
  };
}
