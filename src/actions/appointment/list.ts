'use server';

import { z } from 'zod';

import { parseOrFail, requireUser } from '@/actions/_common/guards';
import { actionError, actionSuccess } from '@/actions/_common/result';

import type {
  AppointmentListItem,
  ListAppointmentsParams,
  ListAppointmentsResult,
} from './types';

interface AppointmentListRow {
  appointment_id: string;
  title: string;
  status: 'pending' | 'confirmed' | 'canceled';
  start_at: string;
  ends_at: string;
  creator_id: string;
  creator_name: string | null;
  creator_nickname: string | null;
  place_id: string;
  place_name: string;
  place_address: string;
  place_category: string | null;
  member_count: number;
  comment_count: number;
  is_owner: boolean;
  is_member: boolean;
}

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 30;

const listAppointmentsSchema = z.object({
  groupId: z
    .string()
    .min(1, '그룹 ID가 필요합니다.')
    .uuid('유효한 그룹 ID가 아닙니다.'),
  period: z.enum(['today', 'week', 'month', 'all']).optional().default('all'),
  type: z.enum(['all', 'created', 'joined']).optional().default('all'),
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

export async function listAppointmentsAction(
  params: ListAppointmentsParams,
): Promise<ListAppointmentsResult> {
  const parsed = parseOrFail(listAppointmentsSchema, params);
  if (!parsed.ok) {
    return parsed;
  }
  const { groupId, period, type, cursor, limit } = parsed.data;

  const auth = await requireUser();
  if (!auth.ok) {
    return auth;
  }

  const { supabase, user } = auth;
  const userId = user.id;

  const listAppointmentsRpc = 'list_appointments_with_stats_cursor' as never;
  const listAppointmentsParams = {
    p_user_id: userId,
    p_group_id: groupId,
    p_period: period,
    p_type: type,
    p_cursor_start_at: cursor?.startAt ?? null,
    p_cursor_appointment_id: cursor?.appointmentId ?? null,
    p_limit: limit,
  } as never;
  const { data, error } = await supabase.rpc(
    listAppointmentsRpc,
    listAppointmentsParams,
  );

  if (error) {
    console.error('[listAppointmentsAction] rpc failed', {
      message: error.message,
      code: error.code,
    });
    return actionError('server-error', '약속 목록을 가져올 수 없습니다.');
  }

  const rows = (data as AppointmentListRow[] | null) ?? [];
  if (rows.length === 0) {
    return actionSuccess({ appointments: [], nextCursor: null });
  }

  const hasMore = rows.length > limit;
  const visibleRows = hasMore ? rows.slice(0, limit) : rows;

  const lastAppointment = visibleRows[visibleRows.length - 1];
  const nextCursor =
    hasMore && lastAppointment
      ? {
          startAt: lastAppointment.start_at,
          appointmentId: lastAppointment.appointment_id,
        }
      : null;

  const mappedAppointments: AppointmentListItem[] = visibleRows.map((row) => {
    return {
      appointmentId: row.appointment_id,
      title: row.title,
      status: row.status === 'canceled' ? 'canceled' : 'pending',
      startAt: row.start_at,
      endsAt: row.ends_at,
      creatorId: row.creator_id,
      creatorName: row.creator_name,
      creatorNickname: row.creator_nickname,
      place: {
        placeId: row.place_id,
        name: row.place_name || '장소 미정',
        address: row.place_address || '',
        category: row.place_category,
      },
      memberCount: Number(row.member_count) || 0,
      commentCount: Number(row.comment_count) || 0,
      isOwner: row.is_owner,
      isMember: row.is_member,
    };
  });

  return actionSuccess({
    appointments: mappedAppointments,
    nextCursor,
  });
}
