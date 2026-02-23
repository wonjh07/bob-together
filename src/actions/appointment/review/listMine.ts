'use server';

import { z } from 'zod';

import { parseOrFail, requireUser } from '@/actions/_common/guards';
import { actionError, actionSuccess } from '@/actions/_common/result';

import type { ListMyReviewsResult, MyReviewItem } from '../types';

const USER_REVIEW_TABLE = 'user_review' as never;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 30;

const listMyReviewsSchema = z.object({
  cursor: z
    .object({
      offset: z.number().int().min(0),
    })
    .nullable()
    .optional(),
  limit: z.number().int().min(1).max(MAX_LIMIT).optional(),
});

type ListMyReviewsParams = z.infer<typeof listMyReviewsSchema>;

interface MyReviewRow {
  appointment_id: string | null;
  place_id: string;
  score: number | null;
  review: string | null;
  edited_at: string | null;
  created_at: string;
  appointment: {
    appointment_id: string;
    place: {
      place_id: string;
      name: string | null;
    } | null;
  } | null;
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

  const { supabase, user } = auth;
  const { cursor, limit = DEFAULT_LIMIT } = parsed.data;
  const offset = cursor?.offset ?? 0;

  const { data, error } = await supabase
    .from(USER_REVIEW_TABLE)
    .select(
      `
      appointment_id,
      place_id,
      score,
      review,
      edited_at,
      created_at,
      appointment:appointments!user_review_appointment_id_fkey(
        appointment_id,
        place:places!appointments_place_id_fkey(
          place_id,
          name
        )
      )
      `,
    )
    .eq('user_id', user.id)
    .not('appointment_id', 'is', null)
    .or('score.not.is.null,review.not.is.null')
    .order('edited_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .order('appointment_id', { ascending: false })
    .range(offset, offset + limit);

  if (error) {
    return actionError('server-error', '내 리뷰 목록을 불러오지 못했습니다.');
  }

  const rows = (data as unknown as MyReviewRow[] | null) ?? [];
  if (rows.length === 0) {
    return actionSuccess({
      reviews: [],
      nextCursor: null,
    });
  }

  const hasMore = rows.length > limit;
  const visibleRows = hasMore ? rows.slice(0, limit) : rows;

  const reviews: MyReviewItem[] = visibleRows
    .filter((row): row is MyReviewRow & { appointment_id: string } =>
      Boolean(row.appointment_id),
    )
    .map((row) => ({
      appointmentId: row.appointment_id,
      placeId: row.place_id,
      placeName: row.appointment?.place?.name || '장소 미정',
      score: Math.max(0, Math.min(5, Math.round(row.score ?? 0))),
      content: row.review?.trim() || '',
      editedAt: row.edited_at || row.created_at,
    }));

  return actionSuccess({
    reviews,
    nextCursor: hasMore
      ? {
          offset: offset + limit,
        }
      : null,
  });
}
