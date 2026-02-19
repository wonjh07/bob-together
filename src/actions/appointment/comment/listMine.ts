'use server';

import { z } from 'zod';

import { parseOrFail, requireUser } from '@/actions/_common/guards';
import { actionError, actionSuccess } from '@/actions/_common/result';

import type { ListMyCommentsResult, MyCommentItem } from '../types';

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 30;

const listMyCommentsSchema = z.object({
  cursor: z
    .object({
      offset: z.number().int().min(0, '유효한 offset이 아닙니다.'),
    })
    .nullable()
    .optional(),
  limit: z.number().int().min(1).max(MAX_LIMIT).optional(),
});

type ListMyCommentsParams = z.infer<typeof listMyCommentsSchema>;

interface MyCommentRow {
  comment_id: string;
  appointment_id: string;
  content: string;
  created_at: string;
  appointment: {
    title: string | null;
  } | null;
}

export async function listMyCommentsAction(
  params: ListMyCommentsParams = {},
): Promise<ListMyCommentsResult> {
  const parsed = parseOrFail(listMyCommentsSchema, params);
  if (!parsed.ok) {
    return parsed;
  }

  const auth = await requireUser();
  if (!auth.ok) {
    return auth;
  }

  const { supabase, user } = auth;
  const { cursor, limit = DEFAULT_LIMIT } = parsed.data;
  const offset = cursor?.offset ?? 0;

  const { data, error } = await supabase
    .from('appointment_comments')
    .select(
      `
      comment_id,
      appointment_id,
      content,
      created_at,
      appointment:appointments!appointment_comments_appointment_id_fkey(
        title
      )
      `,
    )
    .eq('user_id', user.id)
    .eq('is_deleted', false)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .order('comment_id', { ascending: false })
    .range(offset, offset + limit);

  if (error) {
    return actionError('server-error', '내 댓글 목록을 불러오지 못했습니다.');
  }

  const rows = (data as MyCommentRow[] | null) ?? [];
  if (rows.length === 0) {
    return actionSuccess({
      comments: [],
      nextCursor: null,
    });
  }

  const hasMore = rows.length > limit;
  const visibleRows = hasMore ? rows.slice(0, limit) : rows;

  const comments: MyCommentItem[] = visibleRows.map((row) => ({
    commentId: row.comment_id,
    appointmentId: row.appointment_id,
    appointmentTitle: row.appointment?.title || '약속',
    content: row.content,
    createdAt: row.created_at,
  }));

  return actionSuccess({
    comments,
    nextCursor: hasMore
      ? {
          offset: offset + limit,
        }
      : null,
  });
}
