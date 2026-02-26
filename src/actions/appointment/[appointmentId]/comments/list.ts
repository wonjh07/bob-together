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

interface AppointmentCommentRow {
  comment_id: string;
  content: string;
  created_at: string;
  user_id: string;
  name: string | null;
  nickname: string | null;
  profile_image: string | null;
}

interface GetAppointmentCommentsRpcRow {
  ok: boolean;
  error_code: string | null;
  comment_count: number | null;
  comments: unknown;
}

function mapRpcComments(comments: unknown): AppointmentCommentRow[] {
  if (!Array.isArray(comments)) {
    return [];
  }

  return comments.flatMap((comment) => {
    if (!comment || typeof comment !== 'object') {
      return [];
    }

    const row = comment as AppointmentCommentRow;
    if (
      typeof row.comment_id !== 'string'
      || typeof row.content !== 'string'
      || typeof row.created_at !== 'string'
      || typeof row.user_id !== 'string'
    ) {
      return [];
    }

    return [{
      comment_id: row.comment_id,
      content: row.content,
      created_at: row.created_at,
      user_id: row.user_id,
      name: typeof row.name === 'string' ? row.name : null,
      nickname: typeof row.nickname === 'string' ? row.nickname : null,
      profile_image:
        typeof row.profile_image === 'string'
          ? row.profile_image
          : null,
    }];
  });
}

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
  const listCommentsRpc = 'get_appointment_comments_with_cursor' as never;
  const listCommentsRpcParams = {
    p_user_id: userId,
    p_appointment_id: appointmentId,
    p_limit: limit,
    p_cursor_created_at: cursor?.createdAt ?? null,
    p_cursor_comment_id: cursor?.commentId ?? null,
    p_include_count: isFirstPage,
  } as never;
  const { data, error } = await supabase.rpc(listCommentsRpc, listCommentsRpcParams);

  if (error) {
    if (error.code === '42501') {
      return actionError('forbidden', '댓글을 볼 권한이 없습니다.');
    }
    return actionError('server-error', '댓글을 불러오지 못했습니다.');
  }

  const rpcRow = ((data as GetAppointmentCommentsRpcRow[] | null) ?? [])[0] ?? null;
  if (!rpcRow) {
    return actionError('server-error', '댓글을 불러오지 못했습니다.');
  }
  if (!rpcRow.ok) {
    if (rpcRow.error_code === 'forbidden') {
      return actionError('forbidden', '댓글을 볼 권한이 없습니다.');
    }
    if (rpcRow.error_code === 'invalid-format') {
      return actionError('invalid-format', '유효한 커서 정보가 아닙니다.');
    }
    return actionError('server-error', '댓글을 불러오지 못했습니다.');
  }

  const rows = mapRpcComments(rpcRow.comments);
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
    name: row.name,
    nickname: row.nickname,
    profileImage: row.profile_image,
  }));

  let commentCount = 0;
  if (isFirstPage) {
    if (typeof rpcRow.comment_count !== 'number') {
      return actionError('server-error', '댓글 수를 불러오지 못했습니다.');
    }
    commentCount = rpcRow.comment_count;
  }

  return actionSuccess({
    commentCount,
    comments,
    nextCursor,
    currentUserId: userId,
  });
}
