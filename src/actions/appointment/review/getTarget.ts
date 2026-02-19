'use server';

import { z } from 'zod';

import { parseOrFail, requireUser } from '@/actions/_common/guards';
import { actionError, actionSuccess } from '@/actions/_common/result';

import type { GetAppointmentReviewTargetResult } from '../types';

const getReviewTargetSchema = z.object({
  appointmentId: z.string().uuid('유효한 약속 정보가 필요합니다.'),
});

interface ReviewTargetRow {
  appointment_id: string;
  title: string;
  start_at: string;
  ends_at: string;
  status: 'pending' | 'canceled';
  creator_id: string;
  place_id: string;
  place: {
    place_id: string;
    name: string | null;
    address: string | null;
    category: string | null;
  } | null;
}

interface PlaceReviewRow {
  place_id: string;
  score: number | null;
  review: string | null;
  user_id: string;
}

function hasReviewContent(row: { score: number | null; review: string | null } | null) {
  if (!row) return false;
  if (typeof row.score === 'number') return true;
  if (typeof row.review === 'string' && row.review.trim().length > 0) return true;
  return false;
}

export async function getAppointmentReviewTargetAction(
  appointmentId: string,
): Promise<GetAppointmentReviewTargetResult> {
  const parsed = parseOrFail(getReviewTargetSchema, { appointmentId });
  if (!parsed.ok) {
    return parsed;
  }

  const auth = await requireUser();
  if (!auth.ok) {
    return auth;
  }
  const { supabase, user } = auth;

  const { data, error } = await supabase
    .from('appointments')
    .select(
      `
      appointment_id,
      title,
      start_at,
      ends_at,
      status,
      creator_id,
      place_id,
      place:places!appointments_place_id_fkey(
        place_id,
        name,
        address,
        category
      )
      `,
    )
    .eq('appointment_id', parsed.data.appointmentId)
    .maybeSingle();

  if (error || !data) {
    return actionError('forbidden', '리뷰 대상 약속을 찾을 수 없습니다.');
  }

  const appointment = data as ReviewTargetRow;
  const nowTime = Date.now();
  const endsAtTime = new Date(appointment.ends_at).getTime();

  if (appointment.status === 'canceled' || endsAtTime > nowTime) {
    return actionError('forbidden', '종료된 약속만 리뷰를 작성할 수 있습니다.');
  }

  if (appointment.creator_id !== user.id) {
    const { data: membershipData, error: membershipError } = await supabase
      .from('appointment_members')
      .select('appointment_id')
      .eq('appointment_id', appointment.appointment_id)
      .eq('user_id', user.id)
      .maybeSingle();

    if (membershipError || !membershipData) {
      return actionError('forbidden', '리뷰 작성 권한이 없습니다.');
    }
  }

  const [placeReviewsResult, myReviewResult] = await Promise.all([
    supabase
      .from('user_places')
      .select('place_id, score, review, user_id')
      .eq('place_id', appointment.place_id)
      .or('score.not.is.null,review.not.is.null'),
    supabase
      .from('user_places')
      .select('score, review')
      .eq('place_id', appointment.place_id)
      .eq('user_id', user.id)
      .maybeSingle(),
  ]);

  const placeReviewRows =
    (placeReviewsResult.data as PlaceReviewRow[] | null) ?? [];
  let reviewSum = 0;
  let reviewCount = 0;
  for (const row of placeReviewRows) {
    if (typeof row.score !== 'number') continue;
    reviewSum += row.score;
    reviewCount += 1;
  }

  const reviewAverage =
    reviewCount > 0 ? Number((reviewSum / reviewCount).toFixed(1)) : null;

  const myReviewRow = (myReviewResult.data as {
    score: number | null;
    review: string | null;
  } | null) ?? null;
  const alreadyReviewed = hasReviewContent(myReviewRow);

  return actionSuccess({
    target: {
      appointmentId: appointment.appointment_id,
      title: appointment.title,
      startAt: appointment.start_at,
      endsAt: appointment.ends_at,
      place: {
        placeId: appointment.place_id,
        name: appointment.place?.name || '장소 미정',
        address: appointment.place?.address || '',
        category: appointment.place?.category ?? null,
        reviewAverage,
        reviewCount,
      },
      myReview: myReviewRow
        ? {
            score: myReviewRow.score,
            content: myReviewRow.review,
          }
        : null,
      hasReviewed: alreadyReviewed,
      canWriteReview: true,
    },
  });
}
