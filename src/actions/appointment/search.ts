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
import { appointmentSearchSchema } from '@/schemas/appointment';

import type {
  AppointmentSearchCursor,
  AppointmentSearchItem,
  SearchAppointmentsResult,
} from './types';

interface SearchAppointmentsByTitleParams {
  query: string;
  cursor?: AppointmentSearchCursor | null;
  limit?: number;
}

interface SearchAppointmentsRow {
  appointment_id: string;
  title: string;
  start_at: string;
  ends_at: string;
  host_name: string | null;
  host_nickname: string | null;
  host_profile_image: string | null;
  member_count: number;
}

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 30;
const searchAppointmentsByTitleSchema = z.object({
  query: appointmentSearchSchema,
  cursor: z
    .object({
      startAt: z.string().datetime({
        offset: true,
        message: '유효한 커서 정보가 아닙니다.',
      }),
      appointmentId: z.string().uuid('유효한 커서 정보가 아닙니다.'),
    })
    .nullable()
    .optional(),
  limit: z.number().int().min(1).max(MAX_LIMIT).optional().default(DEFAULT_LIMIT),
});

export async function searchAppointmentsByTitleAction(
  params: SearchAppointmentsByTitleParams,
): Promise<SearchAppointmentsResult> {
  const state = await runServiceAction({
    serverErrorMessage: '약속 검색 중 오류가 발생했습니다.',
    run: async ({ requestId }) => {
      const parsed = searchAppointmentsByTitleSchema.safeParse(params);
      if (!parsed.success) {
        return createZodValidationErrorState({
          requestId,
          error: parsed.error,
          fallbackMessage: '입력값이 올바르지 않습니다.',
        });
      }
      const { query, cursor, limit } = parsed.data;

      const auth = await requireUserService(requestId);
      if (!('supabase' in auth)) {
        return auth;
      }
      const { supabase, user } = auth;

      const { data, error } = await supabase.rpc('search_appointments_with_count', {
        p_user_id: user.id,
        p_query: query,
        p_limit: limit,
        p_cursor_start_at: cursor?.startAt ?? undefined,
        p_cursor_appointment_id: cursor?.appointmentId ?? undefined,
      });

      if (error) {
        return createActionErrorState({
          requestId,
          code: 'server',
          message: '약속 검색 중 오류가 발생했습니다.',
          error,
        });
      }

      const rows = ((data as SearchAppointmentsRow[] | null) ?? []).filter(
        (row) => row.appointment_id && row.start_at,
      );

      const hasMore = rows.length > limit;
      const visibleRows = hasMore ? rows.slice(0, limit) : rows;
      const lastRow = visibleRows[visibleRows.length - 1];

      const appointments: AppointmentSearchItem[] = visibleRows.map((row) => ({
        appointmentId: row.appointment_id,
        title: row.title,
        startAt: row.start_at,
        endsAt: row.ends_at,
        hostName: row.host_name,
        hostNickname: row.host_nickname,
        hostProfileImage: row.host_profile_image,
        memberCount: Number(row.member_count) || 0,
      }));

      const nextCursor: AppointmentSearchCursor | null =
        hasMore && lastRow
          ? {
              startAt: lastRow.start_at,
              appointmentId: lastRow.appointment_id,
            }
          : null;

      return createActionSuccessState({
        requestId,
        data: {
          appointments,
          nextCursor,
        },
      });
    },
  });

  return toActionResult(state);
}
