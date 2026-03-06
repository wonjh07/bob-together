'use server';

import { z } from 'zod';

import { requireUserService } from '@/actions/_common/guards';
import {
  createActionSuccessState,
  createActionErrorState,
  runServiceAction,
  toActionResult,
  createZodValidationErrorState,
} from '@/actions/_common/service-action';

import type {
  ListReviewableAppointmentsResult,
  ReviewableAppointmentItem,
} from '../types';

const DEFAULT_LIMIT = 6;
const MAX_LIMIT = 20;

const listReviewableSchema = z.object({
  cursor: z
    .object({
      endsAt: z.string().datetime({
        offset: true,
        message: '유효한 커서 정보가 아닙니다.',
      }),
      appointmentId: z.string().uuid('유효한 커서 정보가 아닙니다.'),
    })
    .nullable()
    .optional(),
  limit: z.number().int().min(1).max(MAX_LIMIT).optional(),
});

type ListReviewableParams = z.infer<typeof listReviewableSchema>;

interface ReviewableAppointmentRow {
  appointment_id: string;
  title: string;
  start_at: string;
  ends_at: string;
  place_id: string;
  place_name: string | null;
  review_avg: number | null;
  review_count: number;
}

export async function listReviewableAppointmentsAction(
  params: ListReviewableParams = {},
): Promise<ListReviewableAppointmentsResult> {
  const state = await runServiceAction({
    serverErrorMessage: '리뷰 가능한 약속 목록을 불러오지 못했습니다.',
    run: async ({ requestId }) => {
      const parsed = listReviewableSchema.safeParse(params);
      if (!parsed.success) {
        return createZodValidationErrorState({
          requestId,
          error: parsed.error,
          fallbackMessage: '입력값이 올바르지 않습니다.',
        });
      }

      const auth = await requireUserService(requestId);
      if (!('supabase' in auth)) {
        return auth;
      }

      const { supabase, user } = auth;
      const { cursor, limit = DEFAULT_LIMIT } = parsed.data;
      const { data, error } = await supabase.rpc(
        'list_reviewable_appointments_with_stats_cursor' as never,
        {
          p_user_id: user.id,
          p_limit: limit,
          p_cursor_ends_at: cursor?.endsAt ?? null,
          p_cursor_appointment_id: cursor?.appointmentId ?? null,
        } as never,
      );

      if (error) {
        return createActionErrorState({
          requestId,
          code: 'server',
          message: '리뷰 가능한 약속 목록을 불러오지 못했습니다.',
          error,
        });
      }

      const rows = (data as ReviewableAppointmentRow[] | null) ?? [];
      if (rows.length === 0) {
        return createActionSuccessState({
          requestId,
          data: {
            appointments: [],
            nextCursor: null,
          },
        });
      }

      const hasMore = rows.length > limit;
      const visibleRows = hasMore ? rows.slice(0, limit) : rows;
      const lastRow = visibleRows[visibleRows.length - 1];
      const appointments: ReviewableAppointmentItem[] = visibleRows.map((row) => ({
        appointmentId: row.appointment_id,
        title: row.title,
        startAt: row.start_at,
        endsAt: row.ends_at,
        placeId: row.place_id,
        placeName: row.place_name || '장소 미정',
        reviewAverage:
          typeof row.review_avg === 'number'
            ? Number(row.review_avg.toFixed(1))
            : null,
        reviewCount: Number(row.review_count) || 0,
      }));

      return createActionSuccessState({
        requestId,
        data: {
          appointments,
          nextCursor: hasMore && lastRow
            ? {
                endsAt: lastRow.ends_at,
                appointmentId: lastRow.appointment_id,
              }
            : null,
        },
      });
    },
  });

  return toActionResult(state);
}
