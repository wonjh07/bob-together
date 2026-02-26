'use server';

import { z } from 'zod';

import { parseOrFail, requireUser } from '@/actions/_common/guards';
import { actionError, actionSuccess } from '@/actions/_common/result';

import type { ListMyReviewsResult, MyReviewItem } from '../types';

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 30;

const listMyReviewsSchema = z.object({
  cursor: z
    .object({
      updatedAt: z.string().datetime({
        offset: true,
        message: '유효한 커서 정보가 아닙니다.',
      }),
      reviewId: z.string().uuid('유효한 커서 정보가 아닙니다.'),
    })
    .nullable()
    .optional(),
  limit: z.number().int().min(1).max(MAX_LIMIT).optional(),
});

type ListMyReviewsParams = z.infer<typeof listMyReviewsSchema>;

interface MyReviewRow {
  review_id: string;
  appointment_id: string | null;
  place_id: string;
  score: number | null;
  review: string | null;
  edited_at: string | null;
  created_at: string;
  updated_at: string;
  place_name: string | null;
}

export async function listMyReviewsAction(
  params: ListMyReviewsParams = {},
): Promise<ListMyReviewsResult> {
  const parsed = parseOrFail(listMyReviewsSchema, params);
  if (!parsed.ok) {
    return parsed;
  }

  const auth = await requireUser();
  if (!auth.ok) {
    return auth;
  }

  const { supabase } = auth;
  const { cursor, limit = DEFAULT_LIMIT } = parsed.data;
  const listMyReviewsRpc = 'list_my_reviews_with_cursor' as never;
  const listMyReviewsParams = {
    p_limit: limit,
    p_cursor_updated_at: cursor?.updatedAt ?? null,
    p_cursor_review_id: cursor?.reviewId ?? null,
  } as never;
  const { data, error } = await supabase.rpc(
    listMyReviewsRpc,
    listMyReviewsParams,
  );

  if (error) {
    return actionError('server-error', '내 리뷰 목록을 불러오지 못했습니다.');
  }

  const rows = (data as MyReviewRow[] | null) ?? [];
  if (rows.length === 0) {
    return actionSuccess({
      reviews: [],
      nextCursor: null,
    });
  }

  const hasMore = rows.length > limit;
  const visibleRows = hasMore ? rows.slice(0, limit) : rows;
  const lastRow = visibleRows[visibleRows.length - 1];

  const reviews: MyReviewItem[] = visibleRows
    .filter((row): row is MyReviewRow & { appointment_id: string } =>
      Boolean(row.appointment_id),
    )
    .map((row) => ({
      appointmentId: row.appointment_id,
      placeId: row.place_id,
      placeName: row.place_name || '장소 미정',
      score: Math.max(0, Math.min(5, Math.round(row.score ?? 0))),
      content: row.review?.trim() || '',
      editedAt: row.edited_at || row.created_at,
    }));

  return actionSuccess({
    reviews,
    nextCursor: hasMore && lastRow
      ? {
          updatedAt: lastRow.updated_at,
          reviewId: lastRow.review_id,
        }
      : null,
  });
}
