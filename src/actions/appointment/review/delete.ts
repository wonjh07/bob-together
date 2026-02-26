'use server';

import { z } from 'zod';

import { parseOrFail, requireUser } from '@/actions/_common/guards';
import { actionError, actionSuccess } from '@/actions/_common/result';

import type { DeleteMyReviewResult } from '../types';

const deleteMyReviewSchema = z.object({
  appointmentId: z.string().uuid('유효한 약속 정보가 필요합니다.'),
});

interface DeleteMyReviewRpcRow {
  ok: boolean;
  error_code: string | null;
  appointment_id: string | null;
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
  const { appointmentId } = parsed.data;

  const deleteMyReviewRpc = 'delete_my_review_transactional' as never;
  const deleteMyReviewParams = {
    p_user_id: user.id,
    p_appointment_id: appointmentId,
    p_edited_at: new Date().toISOString(),
  } as never;
  const { data, error } = await supabase.rpc(deleteMyReviewRpc, deleteMyReviewParams);

  if (error) {
    if (error.code === '42501') {
      return actionError('forbidden', '리뷰 삭제 권한이 없습니다.');
    }
    return actionError('server-error', '리뷰 삭제에 실패했습니다.');
  }

  const row = ((data as DeleteMyReviewRpcRow[] | null) ?? [])[0] ?? null;
  if (!row) {
    return actionError('server-error', '리뷰 삭제에 실패했습니다.');
  }

  if (!row.ok) {
    switch (row.error_code) {
      case 'invalid-format':
        return actionError('invalid-format', '유효한 약속 정보가 필요합니다.');
      case 'forbidden':
        return actionError('forbidden', '리뷰 삭제 권한이 없습니다.');
      case 'server-error-read':
        return actionError('server-error', '리뷰 정보를 확인하지 못했습니다.');
      case 'server-error-update':
        return actionError('server-error', '리뷰 삭제에 실패했습니다.');
      default:
        return actionError('server-error', '리뷰 삭제에 실패했습니다.');
    }
  }

  return actionSuccess({
    appointmentId: row.appointment_id ?? appointmentId,
  });
}
