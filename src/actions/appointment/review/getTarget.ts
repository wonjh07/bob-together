'use server';

import { z } from 'zod';

import { requireUserService } from '@/actions/_common/guards';
import {
  createActionSuccessState,
  createActionErrorState,
  createPostgrestErrorState,
  createZodValidationErrorState,
  runServiceAction,
  toActionResult,
} from '@/actions/_common/service-action';

import type {
  GetAppointmentReviewTargetResult,
} from '../types';

const getReviewTargetSchema = z.object({
  appointmentId: z.string().uuid('유효한 약속 정보가 필요합니다.'),
});

interface GetAppointmentReviewTargetRpcRow {
  ok: boolean;
  error_code: string | null;
  appointment_id: string | null;
  title: string | null;
  start_at: string | null;
  ends_at: string | null;
  place_id: string | null;
  place_name: string | null;
  place_address: string | null;
  place_category: string | null;
  review_avg: number | null;
  review_count: number | null;
  my_score: number | null;
  my_review: string | null;
  has_my_review_row: boolean | null;
  has_reviewed: boolean | null;
}

export async function getAppointmentReviewTargetAction(
  appointmentId: string,
): Promise<GetAppointmentReviewTargetResult> {
  const state = await runServiceAction({
    serverErrorMessage: '리뷰 대상 조회 중 오류가 발생했습니다.',
    run: async ({ requestId }) => {
      const parsed = getReviewTargetSchema.safeParse({ appointmentId });
      if (!parsed.success) {
        return createZodValidationErrorState({
          requestId,
          error: parsed.error,
          fallbackMessage: '유효한 약속 정보가 필요합니다.',
        });
      }

      const auth = await requireUserService(requestId);
      if (!('supabase' in auth)) {
        return auth;
      }
      const { supabase, user } = auth;

      const getReviewTargetRpc =
        'get_appointment_review_target_transactional' as never;
      const getReviewTargetParams = {
        p_user_id: user.id,
        p_appointment_id: parsed.data.appointmentId,
      } as never;
      const { data, error } = await supabase.rpc(
        getReviewTargetRpc,
        getReviewTargetParams,
      );

      if (error) {
        return createPostgrestErrorState({
          requestId,
          error,
          permissionCodes: ['42501'],
          permissionMessage: '리뷰 작성 권한이 없습니다.',
          serverMessage: '리뷰 대상 조회 중 오류가 발생했습니다.',
        });
      }

      const row =
        ((data as GetAppointmentReviewTargetRpcRow[] | null) ?? [])[0] ?? null;
      if (!row) {
        return createActionErrorState({
          requestId,
          code: 'server',
          message: '리뷰 대상 조회 중 오류가 발생했습니다.',
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
          case 'invalid-format':
            return createActionErrorState({
              requestId,
              code: 'validation',
              message: '유효한 약속 정보가 필요합니다.',
            });
          default:
            return createActionErrorState({
              requestId,
              code: 'server',
              message: '리뷰 대상 조회 중 오류가 발생했습니다.',
              error: { rpcErrorCode: row.error_code },
            });
        }
      }

      if (
        !row.appointment_id ||
        !row.title ||
        !row.start_at ||
        !row.ends_at ||
        !row.place_id
      ) {
        return createActionErrorState({
          requestId,
          code: 'server',
          message: '리뷰 대상 조회 중 오류가 발생했습니다.',
        });
      }

      return createActionSuccessState({
        requestId,
        data: {
          target: {
            appointmentId: row.appointment_id,
            title: row.title,
            startAt: row.start_at,
            endsAt: row.ends_at,
            place: {
              placeId: row.place_id,
              name: row.place_name || '장소 미정',
              address: row.place_address || '',
              category: row.place_category ?? null,
              reviewAverage: row.review_avg ?? null,
              reviewCount: row.review_count ?? 0,
            },
            myReview:
              row.has_my_review_row === true
                ? {
                    score: row.my_score,
                    content: row.my_review,
                  }
                : null,
            hasReviewed: row.has_reviewed === true,
            canWriteReview: true,
          },
        },
      });
    },
  });

  return toActionResult(state);
}
