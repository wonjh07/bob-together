'use server';

import { parseOrFail, requireUser } from '@/actions/_common/guards';
import { actionError, actionSuccess } from '@/actions/_common/result';
import { appointmentReviewSubmitSchema } from '@/schemas/appointment';

import type { SubmitPlaceReviewResult } from '../types';

const USER_REVIEW_TABLE = 'user_review' as never;

interface ReviewTargetRow {
  appointment_id: string;
  ends_at: string;
  status: 'pending' | 'canceled';
  creator_id: string;
  place_id: string;
}

interface UserReviewRow {
  score: number | null;
  review: string | null;
}

interface DbErrorLike {
  code?: string;
  message?: string;
  details?: string;
  hint?: string;
}

function hasReviewContent(row: UserReviewRow | null) {
  if (!row) return false;
  if (typeof row.score === 'number') return true;
  if (typeof row.review === 'string' && row.review.trim().length > 0) return true;
  return false;
}

function logReviewDbError(
  stage: 'load-existing-review' | 'save-review',
  context: {
    userId: string;
    appointmentId: string;
  },
  error: DbErrorLike | null,
) {
  if (!error) return;
  console.error(`[submitPlaceReviewAction] ${stage} failed`, {
    userId: context.userId,
    appointmentId: context.appointmentId,
    code: error.code,
    message: error.message,
    details: error.details,
    hint: error.hint,
  });
}

function mapReviewDbError(error: DbErrorLike | null): {
  errorCode: 'forbidden' | 'server-error';
  message: string;
} {
  if (!error?.code) {
    return {
      errorCode: 'server-error',
      message: '리뷰 저장에 실패했습니다.',
    };
  }

  switch (error.code) {
    case '42501':
      return {
        errorCode: 'forbidden',
        message: '리뷰 저장 권한이 없습니다.',
      };
    case '23503':
      return {
        errorCode: 'server-error',
        message: '리뷰 대상 약속 또는 장소 정보가 유효하지 않습니다.',
      };
    case '23505':
      return {
        errorCode: 'server-error',
        message: '이미 해당 약속에 작성된 리뷰가 있습니다.',
      };
    default:
      return {
        errorCode: 'server-error',
        message: '리뷰 저장에 실패했습니다.',
      };
  }
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
    .from(USER_REVIEW_TABLE)
    .select('score, review')
    .eq('appointment_id', appointment.appointment_id)
    .eq('user_id', user.id)
    .maybeSingle();

  if (myReviewError) {
    logReviewDbError(
      'load-existing-review',
      {
        userId: user.id,
        appointmentId: appointment.appointment_id,
      },
      myReviewError,
    );
    const mapped = mapReviewDbError(myReviewError);
    return actionError(mapped.errorCode, mapped.message);
  }

  const existingReview =
    (myReviewData as unknown as UserReviewRow | null) ?? null;
  const mode: 'created' | 'updated' = hasReviewContent(existingReview)
    ? 'updated'
    : 'created';
  const editedAt = new Date().toISOString();

  let saveError: { message?: string } | null = null;
  if (existingReview) {
    const { error } = await supabase
      .from(USER_REVIEW_TABLE)
      .update(
        {
          score,
          review: content,
          place_id: appointment.place_id,
          edited_at: editedAt,
        } as never,
      )
      .eq('user_id', user.id)
      .eq('appointment_id', appointment.appointment_id);

    saveError = error;
  } else {
    const { error } = await supabase.from(USER_REVIEW_TABLE).insert(
      {
        user_id: user.id,
        appointment_id: appointment.appointment_id,
        place_id: appointment.place_id,
        score,
        review: content,
        edited_at: editedAt,
      } as never,
    );
    saveError = error;
  }

  if (saveError) {
    logReviewDbError(
      'save-review',
      {
        userId: user.id,
        appointmentId: appointment.appointment_id,
      },
      saveError,
    );
    const mapped = mapReviewDbError(saveError);
    return actionError(mapped.errorCode, mapped.message);
  }

  return actionSuccess({
    appointmentId: appointment.appointment_id,
    placeId: appointment.place_id,
    score,
    content,
    mode,
  });
}
