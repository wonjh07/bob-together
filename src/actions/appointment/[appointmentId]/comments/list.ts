'use server';

import { z } from 'zod';

import { parseOrFail, requireUser } from '@/actions/_common/guards';
import { actionError, actionSuccess } from '@/actions/_common/result';

import type {
  AppointmentCommentItem,
  GetAppointmentCommentsResult,
} from '@/actions/appointment/types';

const appointmentIdSchema = z.string().uuid('유효한 약속 ID가 아닙니다.');

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

export async function getAppointmentCommentsAction(
  appointmentId: string,
): Promise<GetAppointmentCommentsResult> {
  const parsed = parseOrFail(appointmentIdSchema, appointmentId);
  if (!parsed.ok) {
    return parsed;
  }

  const auth = await requireUser();
  if (!auth.ok) {
    return auth;
  }

  const { supabase, user } = auth;
  const userId = user.id;

  const { data: appointmentData, error: appointmentError } = await supabase
    .from('appointments')
    .select('appointment_id')
    .eq('appointment_id', parsed.data)
    .maybeSingle();

  if (appointmentError || !appointmentData) {
    return actionError('forbidden', '댓글을 볼 권한이 없습니다.');
  }

  const { data, count, error } = await supabase
    .from('appointment_comments')
    .select(
      'comment_id, content, created_at, user_id, users(name, nickname, profile_image)',
      {
        count: 'exact',
      },
    )
    .eq('appointment_id', parsed.data)
    .eq('is_deleted', false)
    .is('deleted_at', null)
    .order('created_at', { ascending: true });

  if (error) {
    return actionError('server-error', '댓글을 불러오지 못했습니다.');
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

  return actionSuccess({
    commentCount: count ?? comments.length,
    comments,
    currentUserId: userId,
  });
}
