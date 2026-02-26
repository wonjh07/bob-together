'use server';

import { z } from 'zod';

import { parseOrFail, requireUser } from '@/actions/_common/guards';
import { actionError, actionSuccess } from '@/actions/_common/result';

import type {
  AppointmentCommentItem,
  AppointmentCommentsCursor,
  GetAppointmentCommentsResult,
} from '@/actions/appointment/types';

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

const listAppointmentCommentsSchema = z.object({
  appointmentId: z.string().uuid('유효한 약속 ID가 아닙니다.'),
  cursor: z
    .object({
      createdAt: z.string().datetime({
        offset: true,
        message: '유효한 커서 정보가 아닙니다.',
      }),
      commentId: z.string().uuid('유효한 커서 정보가 아닙니다.'),
    })
    .nullable()
    .optional(),
  limit: z.number().int().min(1).max(MAX_LIMIT).optional(),
});

type ListAppointmentCommentsParams = z.infer<typeof listAppointmentCommentsSchema>;

export async function getAppointmentCommentsAction(
  params: ListAppointmentCommentsParams,
): Promise<GetAppointmentCommentsResult> {
  const parsed = parseOrFail(listAppointmentCommentsSchema, params);
  if (!parsed.ok) {
    return parsed;
  }

  const auth = await requireUser();
  if (!auth.ok) {
    return auth;
  }

  const { supabase, user } = auth;
  const { appointmentId, cursor, limit = DEFAULT_LIMIT } = parsed.data;
  const userId = user.id;
  const isFirstPage = !cursor;

  if (isFirstPage) {
    const { data: appointmentData, error: appointmentError } = await supabase
      .from('appointments')
      .select('appointment_id')
      .eq('appointment_id', appointmentId)
      .maybeSingle();

    if (appointmentError || !appointmentData) {
      return actionError('forbidden', '댓글을 볼 권한이 없습니다.');
    }
  }

  let query = supabase
    .from('appointment_comments')
    .select(
      'comment_id, content, created_at, user_id, users(name, nickname, profile_image)',
      isFirstPage ? { count: 'exact' } : undefined,
    )
    .eq('appointment_id', appointmentId)
    .eq('is_deleted', false)
    .is('deleted_at', null);

  if (cursor) {
    query = query.or(
      `created_at.lt.${cursor.createdAt},and(created_at.eq.${cursor.createdAt},comment_id.lt.${cursor.commentId})`,
    );
  }

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .order('comment_id', { ascending: false })
    .limit(limit + 1);

  if (error) {
    return actionError('server-error', '댓글을 불러오지 못했습니다.');
  }

  let commentCount = 0;
  if (isFirstPage) {
    if (typeof count !== 'number') {
      return actionError('server-error', '댓글 수를 불러오지 못했습니다.');
    }
    commentCount = count;
  }

  type AppointmentCommentRow = {
    comment_id: string;
    content: string;
    created_at: string;
    user_id: string;
    users: {
      name: string | null;
      nickname: string | null;
      profile_image: string | null;
    } | null;
  };

  const rows = (data as AppointmentCommentRow[] | null) ?? [];
  const hasMore = rows.length > limit;
  const visibleRowsDesc = hasMore ? rows.slice(0, limit) : rows;
  const lastRow = visibleRowsDesc[visibleRowsDesc.length - 1] ?? null;
  const visibleRowsAsc = [...visibleRowsDesc].reverse();
  const nextCursor: AppointmentCommentsCursor | null = hasMore && lastRow
    ? {
        createdAt: lastRow.created_at,
        commentId: lastRow.comment_id,
      }
    : null;

  const comments: AppointmentCommentItem[] = visibleRowsAsc.map((row) => ({
    commentId: row.comment_id,
    content: row.content,
    createdAt: row.created_at,
    userId: row.user_id,
    name: row.users?.name ?? null,
    nickname: row.users?.nickname ?? null,
    profileImage: row.users?.profile_image ?? null,
  }));

  return actionSuccess({
    commentCount,
    comments,
    nextCursor,
    currentUserId: userId,
  });
}
