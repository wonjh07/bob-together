'use server';

import { z } from 'zod';

import { parseOrFail, requireUser } from '@/actions/_common/guards';
import { actionSuccess } from '@/actions/_common/result';

import type {
  AppointmentHistoryItem,
  ListAppointmentHistoryResult,
} from '../types';

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 30;
const USER_REVIEW_TABLE = 'user_review' as never;

const listHistorySchema = z.object({
  cursor: z
    .object({
      offset: z.number().int().min(0),
    })
    .nullable()
    .optional(),
  limit: z.number().int().min(1).max(MAX_LIMIT).optional(),
});

type ListHistoryParams = z.infer<typeof listHistorySchema>;

interface HistoryAppointmentRow {
  appointment_id: string;
  title: string;
  start_at: string;
  ends_at: string;
  creator_id: string;
  place_id: string;
  creator: {
    user_id: string;
    name: string | null;
    nickname: string | null;
    profile_image: string | null;
  } | null;
  place: {
    place_id: string;
    name: string | null;
    address: string | null;
    category: string | null;
  } | null;
}

interface AppointmentMemberRow {
  appointment_id: string;
}

interface PlaceReviewRow {
  appointment_id: string | null;
  place_id: string;
  user_id: string;
  score: number | null;
  review: string | null;
}

export async function listAppointmentHistoryAction(
  params: ListHistoryParams = {},
): Promise<ListAppointmentHistoryResult> {
  const parsed = parseOrFail(listHistorySchema, params);
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
    .from('appointments')
    .select(
      `
      appointment_id,
      title,
      start_at,
      ends_at,
      creator_id,
      place_id,
      creator:users!appointments_creator_id_fkey(
        user_id,
        name,
        nickname,
        profile_image
      ),
      place:places!appointments_place_id_fkey(
        place_id,
        name,
        address,
        category
      ),
      participant:appointment_members!inner(
        user_id
      )
      `,
    )
    .eq('participant.user_id', user.id)
    .neq('status', 'canceled')
    .lte('ends_at', nowIso)
    .order('ends_at', { ascending: false })
    .order('appointment_id', { ascending: false })
    .range(offset, offset + limit);

  if (error) {
    return {
      ok: false,
      error: 'server-error',
      message: '히스토리 약속 목록을 불러오지 못했습니다.',
    };
  }

  const rows = ((data as HistoryAppointmentRow[] | null) ?? []).filter(
    (row) => row.appointment_id && row.place_id,
  );

  if (rows.length === 0) {
    return actionSuccess({
      appointments: [],
      nextCursor: null,
    });
  }

  const hasMore = rows.length > limit;
  const visibleRows = hasMore ? rows.slice(0, limit) : rows;
  const appointmentIds = visibleRows.map((row) => row.appointment_id);
  const placeIds = Array.from(new Set(visibleRows.map((row) => row.place_id)));

  const [memberResult, placeReviewResult] = await Promise.all([
    supabase
      .from('appointment_members')
      .select('appointment_id')
      .in('appointment_id', appointmentIds),
    supabase
      .from(USER_REVIEW_TABLE)
      .select('appointment_id, place_id, user_id, score, review')
      .in('place_id', placeIds)
      .not('appointment_id', 'is', null)
      .or('score.not.is.null,review.not.is.null'),
  ]);

  const memberCountByAppointment = new Map<string, number>();
  if (!memberResult.error) {
    const memberRows = (memberResult.data as AppointmentMemberRow[] | null) ?? [];
    for (const row of memberRows) {
      memberCountByAppointment.set(
        row.appointment_id,
        (memberCountByAppointment.get(row.appointment_id) ?? 0) + 1,
      );
    }
  }

  const reviewStatsByPlace = new Map<string, { sum: number; count: number }>();
  const reviewedAppointmentIds = new Set<string>();
  if (!placeReviewResult.error) {
    const placeReviewRows =
      (placeReviewResult.data as unknown as PlaceReviewRow[] | null) ?? [];
    for (const row of placeReviewRows) {
      if (typeof row.score === 'number') {
        const previous = reviewStatsByPlace.get(row.place_id) ?? { sum: 0, count: 0 };
        reviewStatsByPlace.set(row.place_id, {
          sum: previous.sum + row.score,
          count: previous.count + 1,
        });
      }

      const hasMyReview =
        typeof row.appointment_id === 'string' &&
        row.user_id === user.id &&
        (typeof row.score === 'number' ||
          (typeof row.review === 'string' && row.review.trim().length > 0));

      if (hasMyReview && row.appointment_id) {
        reviewedAppointmentIds.add(row.appointment_id);
      }
    }
  }

  const appointments: AppointmentHistoryItem[] = visibleRows.map((row) => {
    const stats = reviewStatsByPlace.get(row.place_id);
    const reviewAverage =
      stats && stats.count > 0
        ? Number((stats.sum / stats.count).toFixed(1))
        : null;

    return {
      appointmentId: row.appointment_id,
      title: row.title,
      startAt: row.start_at,
      endsAt: row.ends_at,
      creatorId: row.creator_id,
      creatorName: row.creator?.name ?? null,
      creatorNickname: row.creator?.nickname ?? null,
      creatorProfileImage: row.creator?.profile_image ?? null,
      place: {
        placeId: row.place_id,
        name: row.place?.name || '장소 미정',
        address: row.place?.address || '',
        category: row.place?.category ?? null,
        reviewAverage,
        reviewCount: stats?.count ?? 0,
      },
      memberCount: memberCountByAppointment.get(row.appointment_id) ?? 0,
      isOwner: row.creator_id === user.id,
      canWriteReview: !reviewedAppointmentIds.has(row.appointment_id),
    };
  });

  return actionSuccess({
    appointments,
    nextCursor: hasMore
      ? {
          offset: offset + limit,
        }
      : null,
  });
}
