'use server';

import { z } from 'zod';

import { parseOrFail, requireUser } from '@/actions/_common/guards';
import { actionSuccess } from '@/actions/_common/result';

import type {
  AppointmentHistoryItem,
  ListAppointmentHistoryResult,
} from '../types';

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 30;

const listHistorySchema = z.object({
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

type ListHistoryParams = z.infer<typeof listHistorySchema>;

interface AppointmentHistoryRpcRow {
  appointment_id: string;
  title: string;
  start_at: string;
  ends_at: string;
  creator_id: string;
  creator_name: string | null;
  creator_nickname: string | null;
  creator_profile_image: string | null;
  place_id: string;
  place_name: string | null;
  place_address: string | null;
  place_category: string | null;
  member_count: number | string | null;
  review_avg: number | string | null;
  review_count: number | string | null;
  can_write_review: boolean | null;
}

function toCount(value: number | string | null): number {
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric > 0 ? Math.floor(numeric) : 0;
}

function toNullableNumber(value: number | string | null): number | null {
  if (value === null) {
    return null;
  }

  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

export async function listAppointmentHistoryAction(
  params: ListHistoryParams = {},
): Promise<ListAppointmentHistoryResult> {
  const parsed = parseOrFail(listHistorySchema, params);
  if (!parsed.ok) {
    return parsed;
  }

  const auth = await requireUser();
  if (!auth.ok) {
    return auth;
  }

  const { supabase, user } = auth;
  const { cursor, limit = DEFAULT_LIMIT } = parsed.data;
  const historyRpc = 'list_appointment_history_with_stats_cursor' as never;
  const historyRpcParams = {
    p_user_id: user.id,
    p_limit: limit,
    p_cursor_ends_at: cursor?.endsAt ?? null,
    p_cursor_appointment_id: cursor?.appointmentId ?? null,
  } as never;
  const { data, error } = await supabase.rpc(
    historyRpc,
    historyRpcParams,
  );

  if (error) {
    return {
      ok: false,
      error: 'server-error',
      message: '히스토리 약속 목록을 불러오지 못했습니다.',
    };
  }

  const rows = (data as AppointmentHistoryRpcRow[] | null) ?? [];

  if (rows.length === 0) {
    return actionSuccess({
      appointments: [],
      nextCursor: null,
    });
  }

  const hasMore = rows.length > limit;
  const visibleRows = hasMore ? rows.slice(0, limit) : rows;
  const lastRow = visibleRows[visibleRows.length - 1];

  const appointments: AppointmentHistoryItem[] = visibleRows.map((row) => {
    return {
      appointmentId: row.appointment_id,
      title: row.title,
      startAt: row.start_at,
      endsAt: row.ends_at,
      creatorId: row.creator_id,
      creatorName: row.creator_name,
      creatorNickname: row.creator_nickname,
      creatorProfileImage: row.creator_profile_image,
      place: {
        placeId: row.place_id,
        name: row.place_name || '장소 미정',
        address: row.place_address || '',
        category: row.place_category,
        reviewAverage: toNullableNumber(row.review_avg),
        reviewCount: toCount(row.review_count),
      },
      memberCount: toCount(row.member_count),
      isOwner: row.creator_id === user.id,
      canWriteReview: row.can_write_review !== false,
    };
  });

  return actionSuccess({
    appointments,
    nextCursor: hasMore && lastRow
      ? {
          endsAt: lastRow.ends_at,
          appointmentId: lastRow.appointment_id,
        }
      : null,
  });
}
