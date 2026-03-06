'use server';

import { z } from 'zod';

import { requireUserService } from '@/actions/_common/guards';
import {
  createActionSuccessState,
  createActionErrorState,
  runServiceAction,
  toActionResult,
  createZodValidationErrorState,
} from '@/actions/_common/service-action';

import type { ListMyCommentsResult, MyCommentItem } from '../types';

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 30;

const listMyCommentsSchema = z.object({
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

type ListMyCommentsParams = z.infer<typeof listMyCommentsSchema>;

interface MyCommentRow {
  comment_id: string;
  appointment_id: string;
  content: string;
  created_at: string;
  appointment_title: string | null;
}

export async function listMyCommentsAction(
  params: ListMyCommentsParams = {},
): Promise<ListMyCommentsResult> {
  const state = await runServiceAction({
    serverErrorMessage: '내 댓글 목록을 불러오지 못했습니다.',
    run: async ({ requestId }) => {
      const parsed = listMyCommentsSchema.safeParse(params);
      if (!parsed.success) {
        return createZodValidationErrorState({
          requestId,
          error: parsed.error,
          fallbackMessage: '입력값이 올바르지 않습니다.',
        });
      }

      const auth = await requireUserService(requestId);
      if (!('supabase' in auth)) {
        return auth;
      }

      const { supabase } = auth;
      const { cursor, limit = DEFAULT_LIMIT } = parsed.data;
      const listMyCommentsRpc = 'list_my_comments_with_cursor' as never;
      const listMyCommentsParams = {
        p_limit: limit,
        p_cursor_created_at: cursor?.createdAt ?? null,
        p_cursor_comment_id: cursor?.commentId ?? null,
      } as never;
      const { data, error } = await supabase.rpc(
        listMyCommentsRpc,
        listMyCommentsParams,
      );

      if (error) {
        return createActionErrorState({
          requestId,
          code: 'server',
          message: '내 댓글 목록을 불러오지 못했습니다.',
          error,
        });
      }

      const rows = (data as MyCommentRow[] | null) ?? [];
      if (rows.length === 0) {
        return createActionSuccessState({
          requestId,
          data: {
            comments: [],
            nextCursor: null,
          },
        });
      }

      const hasMore = rows.length > limit;
      const visibleRows = hasMore ? rows.slice(0, limit) : rows;
      const lastRow = visibleRows[visibleRows.length - 1];

      const comments: MyCommentItem[] = visibleRows.map((row) => ({
        commentId: row.comment_id,
        appointmentId: row.appointment_id,
        appointmentTitle: row.appointment_title || '약속',
        content: row.content,
        createdAt: row.created_at,
      }));

      return createActionSuccessState({
        requestId,
        data: {
          comments,
          nextCursor: hasMore && lastRow
            ? {
                createdAt: lastRow.created_at,
                commentId: lastRow.comment_id,
              }
            : null,
        },
      });
    },
  });

  return toActionResult(state);
}
