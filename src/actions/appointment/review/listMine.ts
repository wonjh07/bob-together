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
      offset: z.number().int().min(0),
    })
    .nullable()
    .optional(),
  limit: z.number().int().min(1).max(MAX_LIMIT).optional(),
});

type ListMyReviewsParams = z.infer<typeof listMyReviewsSchema>;

interface UserPlaceReviewRow {
  place_id: string;
  score: number | null;
  review: string | null;
  edited_at: string | null;
  created_at: string;
}

interface PlaceRow {
  place_id: string;
  name: string | null;
}

interface AppointmentByPlaceRow {
  appointment_id: string;
  place_id: string;
  ends_at: string;
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
  const nowIso = new Date().toISOString();

  const { data, error } = await supabase
    .from('user_places')
    .select('place_id, score, review, edited_at, created_at')
    .eq('user_id', user.id)
    .or('score.not.is.null,review.not.is.null')
    .order('edited_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .order('place_id', { ascending: true })
    .range(offset, offset + limit);

  if (error) {
    return actionError('server-error', '내 리뷰 목록을 불러오지 못했습니다.');
  }

  const rows = (data as UserPlaceReviewRow[] | null) ?? [];
  if (rows.length === 0) {
    return actionSuccess({
      reviews: [],
      nextCursor: null,
    });
  }

  const hasMore = rows.length > limit;
  const visibleRows = hasMore ? rows.slice(0, limit) : rows;
  const placeIds = Array.from(new Set(visibleRows.map((row) => row.place_id)));

  const [placesResult, endedAppointmentsResult] = await Promise.all([
    supabase.from('places').select('place_id, name').in('place_id', placeIds),
    supabase
      .from('appointments')
      .select(
        `
        appointment_id,
        place_id,
        ends_at,
        participant:appointment_members!inner(user_id)
        `,
      )
      .eq('participant.user_id', user.id)
      .in('place_id', placeIds)
      .neq('status', 'canceled')
      .lte('ends_at', nowIso)
      .order('ends_at', { ascending: false }),
  ]);

  const placeNameById = new Map<string, string>();
  if (!placesResult.error) {
    const placeRows = (placesResult.data as PlaceRow[] | null) ?? [];
    for (const row of placeRows) {
      placeNameById.set(row.place_id, row.name || '장소 미정');
    }
  }

  const appointmentByPlace = new Map<string, string>();
  if (!endedAppointmentsResult.error) {
    const appointmentRows =
      (endedAppointmentsResult.data as AppointmentByPlaceRow[] | null) ?? [];
    for (const row of appointmentRows) {
      if (appointmentByPlace.has(row.place_id)) continue;
      appointmentByPlace.set(row.place_id, row.appointment_id);
    }
  }

  const missingPlaceIds = placeIds.filter((placeId) => !appointmentByPlace.has(placeId));
  if (missingPlaceIds.length > 0) {
    const { data: fallbackData, error: fallbackError } = await supabase
      .from('appointments')
      .select(
        `
        appointment_id,
        place_id,
        ends_at,
        participant:appointment_members!inner(user_id)
        `,
      )
      .eq('participant.user_id', user.id)
      .in('place_id', missingPlaceIds)
      .order('ends_at', { ascending: false });

    if (!fallbackError) {
      const fallbackRows = (fallbackData as AppointmentByPlaceRow[] | null) ?? [];
      for (const row of fallbackRows) {
        if (appointmentByPlace.has(row.place_id)) continue;
        appointmentByPlace.set(row.place_id, row.appointment_id);
      }
    }
  }

  const reviews: MyReviewItem[] = visibleRows.map((row) => ({
    placeId: row.place_id,
    appointmentId: appointmentByPlace.get(row.place_id) ?? null,
    placeName: placeNameById.get(row.place_id) || '장소 미정',
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
