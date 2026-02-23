'use server';

import { z } from 'zod';

import { parseOrFail, requireUser } from '@/actions/_common/guards';
import { actionError, actionSuccess } from '@/actions/_common/result';

import type {
  ListReviewableAppointmentsResult,
  ReviewableAppointmentItem,
} from '../types';

const DEFAULT_LIMIT = 6;
const MAX_LIMIT = 20;

const listReviewableSchema = z.object({
  cursor: z
    .object({
      offset: z.number().int().min(0),
    })
    .nullable()
    .optional(),
  limit: z.number().int().min(1).max(MAX_LIMIT).optional(),
});

type ListReviewableParams = z.infer<typeof listReviewableSchema>;

interface ReviewableAppointmentRow {
  appointment_id: string;
  title: string;
  start_at: string;
  ends_at: string;
  place_id: string;
  place_name: string | null;
  review_avg: number | null;
  review_count: number;
}

export async function listReviewableAppointmentsAction(
  params: ListReviewableParams = {},
): Promise<ListReviewableAppointmentsResult> {
  const parsed = parseOrFail(listReviewableSchema, params);
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

  const { data, error } = await supabase.rpc(
    'list_reviewable_appointments_with_stats' as never,
    {
      p_user_id: user.id,
      p_offset: offset,
      p_limit: limit,
    } as never,
  );

  if (error) {
    return actionError('server-error', '리뷰 가능한 약속 목록을 불러오지 못했습니다.');
  }

  const rows = (data as unknown as ReviewableAppointmentRow[] | null) ?? [];
  if (rows.length === 0) {
    return actionSuccess({
      appointments: [],
      nextCursor: null,
    });
  }

  const hasMore = rows.length > limit;
  const visibleRows = hasMore ? rows.slice(0, limit) : rows;

  const appointments: ReviewableAppointmentItem[] = visibleRows.map((row) => ({
    appointmentId: row.appointment_id,
    title: row.title,
    startAt: row.start_at,
    endsAt: row.ends_at,
    placeId: row.place_id,
    placeName: row.place_name || '장소 미정',
    reviewAverage:
      typeof row.review_avg === 'number'
        ? Number(row.review_avg.toFixed(1))
        : null,
    reviewCount: Number(row.review_count) || 0,
  }));

  return actionSuccess({
    appointments,
    nextCursor: hasMore
      ? {
          offset: offset + limit,
        }
      : null,
  });
}
