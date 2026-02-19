'use server';

import { parseOrFail, requireUser } from '@/actions/_common/guards';
import { actionError, actionSuccess } from '@/actions/_common/result';
import { appointmentReviewSubmitSchema } from '@/schemas/appointment';

import type { SubmitPlaceReviewResult } from '../types';
import type { Database } from '@/types/database.types';

type UserPlaceInsert = Database['public']['Tables']['user_places']['Insert'];

interface ReviewTargetRow {
  appointment_id: string;
  ends_at: string;
  status: 'pending' | 'canceled';
  creator_id: string;
  place_id: string;
}

interface UserPlaceRow {
  score: number | null;
  review: string | null;
}

function hasReviewContent(row: { score: number | null; review: string | null } | null) {
  if (!row) return false;
  if (typeof row.score === 'number') return true;
  if (typeof row.review === 'string' && row.review.trim().length > 0) return true;
  return false;
}

export async function submitPlaceReviewAction(params: {
  appointmentId: string;
  score: number;
  content: string;
}): Promise<SubmitPlaceReviewResult> {
  const parsed = parseOrFail(appointmentReviewSubmitSchema, params);
  if (!parsed.ok) {
    return parsed;
  }

  const auth = await requireUser();
  if (!auth.ok) {
    return auth;
  }
  const { supabase, user } = auth;
  const { appointmentId, score, content } = parsed.data;

  const { data: appointmentData, error: appointmentError } = await supabase
    .from('appointments')
    .select('appointment_id, ends_at, status, creator_id, place_id')
    .eq('appointment_id', appointmentId)
    .maybeSingle();

  if (appointmentError || !appointmentData) {
    return actionError('forbidden', '리뷰 대상 약속을 찾을 수 없습니다.');
  }

  const appointment = appointmentData as ReviewTargetRow;
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

  const { data: myReviewData, error: myReviewError } = await supabase
    .from('user_places')
    .select('score, review')
    .eq('place_id', appointment.place_id)
    .eq('user_id', user.id)
    .maybeSingle();

  if (myReviewError) {
    return actionError('server-error', '기존 리뷰 정보를 확인하지 못했습니다.');
  }

  const existingReview = (myReviewData as UserPlaceRow | null) ?? null;
  const mode: 'created' | 'updated' = hasReviewContent(existingReview)
    ? 'updated'
    : 'created';

  const payload: UserPlaceInsert = {
    user_id: user.id,
    place_id: appointment.place_id,
    score,
    review: content,
    edited_at: new Date().toISOString(),
  };

  let saveError: { message?: string } | null = null;
  if (existingReview) {
    const { error } = await supabase
      .from('user_places')
      .update({
        score,
        review: content,
        edited_at: payload.edited_at,
      })
      .eq('user_id', user.id)
      .eq('place_id', appointment.place_id);

    saveError = error;
  } else {
    const { error } = await supabase.from('user_places').insert(payload);
    saveError = error;
  }

  if (saveError) {
    return actionError('server-error', '리뷰 저장에 실패했습니다.');
  }

  return actionSuccess({
    placeId: appointment.place_id,
    score,
    content,
    mode,
  });
}
