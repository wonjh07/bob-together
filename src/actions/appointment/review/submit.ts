'use server';

import { requireUserService } from '@/actions/_common/guards';
import {
  createActionSuccessState,
  createActionErrorState,
  createPostgrestErrorState,
  createZodValidationErrorState,
  runServiceAction,
  toActionResult,
} from '@/actions/_common/service-action';
import { appointmentReviewSubmitSchema } from '@/schemas/appointment';

import type { SubmitPlaceReviewResult } from '../types';

interface SubmitPlaceReviewRpcRow {
  ok: boolean;
  error_code: string | null;
  appointment_id: string | null;
  place_id: string | null;
  mode: 'created' | 'updated' | null;
}

export async function submitPlaceReviewAction(params: {
  appointmentId: string;
  score: number;
  content: string;
}): Promise<SubmitPlaceReviewResult> {
  const state = await runServiceAction({
    serverErrorMessage: '리뷰 저장에 실패했습니다.',
    run: async ({ requestId }) => {
      const parsed = appointmentReviewSubmitSchema.safeParse(params);
      if (!parsed.success) {
        return createZodValidationErrorState({
          requestId,
          error: parsed.error,
          fallbackMessage: '요청 형식이 올바르지 않습니다.',
        });
      }

      const auth = await requireUserService(requestId);
      if (!('supabase' in auth)) {
        return auth;
      }

      const { supabase, user } = auth;
      const { appointmentId, score, content } = parsed.data;
      const submitReviewRpc = 'submit_place_review_transactional' as never;
      const submitReviewParams = {
        p_user_id: user.id,
        p_appointment_id: appointmentId,
        p_score: score,
        p_content: content,
        p_edited_at: new Date().toISOString(),
      } as never;
      const { data, error } = await supabase.rpc(
        submitReviewRpc,
        submitReviewParams,
      );

      if (error) {
        return createPostgrestErrorState({
          requestId,
          error,
          permissionCodes: ['42501'],
          permissionMessage: '리뷰 저장 권한이 없습니다.',
          serverMessage: '리뷰 저장에 실패했습니다.',
        });
      }

      const row = ((data as SubmitPlaceReviewRpcRow[] | null) ?? [])[0] ?? null;
      if (!row) {
        return createActionErrorState({
          requestId,
          code: 'server',
          message: '리뷰 저장에 실패했습니다.',
        });
      }

      if (!row.ok) {
        switch (row.error_code) {
          case 'forbidden-not-found':
            return createActionErrorState({
              requestId,
              code: 'permission',
              message: '리뷰 대상 약속을 찾을 수 없습니다.',
            });
          case 'forbidden-not-ended':
            return createActionErrorState({
              requestId,
              code: 'permission',
              message: '종료된 약속만 리뷰를 작성할 수 있습니다.',
            });
          case 'forbidden-no-permission':
          case 'forbidden':
            return createActionErrorState({
              requestId,
              code: 'permission',
              message: '리뷰 작성 권한이 없습니다.',
            });
          case 'invalid-reference':
            return createActionErrorState({
              requestId,
              code: 'server',
              message: '리뷰 대상 약속 또는 장소 정보가 유효하지 않습니다.',
            });
          case 'already-reviewed':
            return createActionErrorState({
              requestId,
              code: 'server',
              message: '이미 해당 약속에 작성된 리뷰가 있습니다.',
            });
          default:
            return createActionErrorState({
              requestId,
              code: 'server',
              message: '리뷰 저장에 실패했습니다.',
              error: { rpcErrorCode: row.error_code },
            });
        }
      }

      if (!row.appointment_id || !row.place_id || !row.mode) {
        return createActionErrorState({
          requestId,
          code: 'server',
          message: '리뷰 저장에 실패했습니다.',
        });
      }

      return createActionSuccessState({
        requestId,
        data: {
          appointmentId: row.appointment_id,
          placeId: row.place_id,
          score,
          content,
          mode: row.mode,
        },
      });
    },
  });

  return toActionResult(state);
}
