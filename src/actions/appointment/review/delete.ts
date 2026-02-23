'use server';

import { z } from 'zod';

import { parseOrFail, requireUser } from '@/actions/_common/guards';
import { actionError, actionSuccess } from '@/actions/_common/result';

import type { DeleteMyReviewResult } from '../types';

const USER_REVIEW_TABLE = 'user_review' as never;

const deleteMyReviewSchema = z.object({
  appointmentId: z.string().uuid('유효한 약속 정보가 필요합니다.'),
});

interface UserReviewRow {
  score: number | null;
  review: string | null;
}

function hasReviewContent(row: UserReviewRow | null) {
  if (!row) return false;
  if (typeof row.score === 'number') return true;
  if (typeof row.review === 'string' && row.review.trim().length > 0) return true;
  return false;
}

export async function deleteMyReviewAction(params: {
  appointmentId: string;
}): Promise<DeleteMyReviewResult> {
  const parsed = parseOrFail(deleteMyReviewSchema, params);
  if (!parsed.ok) {
    return parsed;
  }

  const auth = await requireUser();
  if (!auth.ok) {
    return auth;
  }
  const { supabase, user } = auth;

  const { data: existingReviewData, error: existingReviewError } = await supabase
    .from(USER_REVIEW_TABLE)
    .select('score, review')
    .eq('user_id', user.id)
    .eq('appointment_id', parsed.data.appointmentId)
    .maybeSingle();

  if (existingReviewError) {
    return actionError('server-error', '리뷰 정보를 확인하지 못했습니다.');
  }

  const existingReview =
    (existingReviewData as unknown as UserReviewRow | null) ?? null;
  if (!hasReviewContent(existingReview)) {
    return actionSuccess({
      appointmentId: parsed.data.appointmentId,
    });
  }

  const { error: deleteError } = await supabase
    .from(USER_REVIEW_TABLE)
    .update(
      {
        score: null,
        review: null,
        edited_at: new Date().toISOString(),
      } as never,
    )
    .eq('user_id', user.id)
    .eq('appointment_id', parsed.data.appointmentId);

  if (deleteError) {
    return actionError('server-error', '리뷰 삭제에 실패했습니다.');
  }

  return actionSuccess({
    appointmentId: parsed.data.appointmentId,
  });
}
