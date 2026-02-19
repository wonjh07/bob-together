'use server';

import { z } from 'zod';

import { parseOrFail, requireUser } from '@/actions/_common/guards';
import { actionError, actionSuccess } from '@/actions/_common/result';

import type { DeleteMyReviewResult } from '../types';

const deleteMyReviewSchema = z.object({
  placeId: z.string().uuid('유효한 장소 정보가 필요합니다.'),
});

interface UserPlaceReviewRow {
  score: number | null;
  review: string | null;
}

function hasReviewContent(row: UserPlaceReviewRow | null) {
  if (!row) return false;
  if (typeof row.score === 'number') return true;
  if (typeof row.review === 'string' && row.review.trim().length > 0) return true;
  return false;
}

export async function deleteMyReviewAction(params: {
  placeId: string;
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
    .from('user_places')
    .select('score, review')
    .eq('user_id', user.id)
    .eq('place_id', parsed.data.placeId)
    .maybeSingle();

  if (existingReviewError) {
    return actionError('server-error', '리뷰 정보를 확인하지 못했습니다.');
  }

  const existingReview = (existingReviewData as UserPlaceReviewRow | null) ?? null;
  if (!hasReviewContent(existingReview)) {
    return actionSuccess({
      placeId: parsed.data.placeId,
    });
  }

  const { error: deleteError } = await supabase
    .from('user_places')
    .update({
      score: null,
      review: null,
      edited_at: new Date().toISOString(),
    })
    .eq('user_id', user.id)
    .eq('place_id', parsed.data.placeId);

  if (deleteError) {
    return actionError('server-error', '리뷰 삭제에 실패했습니다.');
  }

  return actionSuccess({
    placeId: parsed.data.placeId,
  });
}
