'use server';

import { z } from 'zod';

import { parseOrFail, requireUser } from '@/actions/_common/guards';
import { actionError, actionSuccess } from '@/actions/_common/result';

import type {
  InvitationListItem,
  ListReceivedInvitationsResult,
} from './types';

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 30;

const listReceivedInvitationsSchema = z.object({
  cursor: z
    .object({
      createdTime: z.string().datetime({
        offset: true,
        message: '유효한 커서 정보가 아닙니다.',
      }),
      invitationId: z.string().uuid('유효한 커서 정보가 아닙니다.'),
    })
    .nullable()
    .optional(),
  limit: z.number().int().min(1).max(MAX_LIMIT).optional(),
});

type ListReceivedInvitationsParams = z.infer<
  typeof listReceivedInvitationsSchema
>;

interface InvitationRow {
  invitation_id: string;
  type: 'group' | 'appointment';
  status: 'pending' | 'accepted' | 'rejected' | 'canceled';
  created_time: string;
  group_id: string;
  appointment_id: string | null;
  inviter_id: string | null;
  inviter_name: string | null;
  inviter_nickname: string | null;
  inviter_profile_image: string | null;
  group_name: string | null;
  appointment_title: string | null;
  appointment_ends_at: string | null;
}

export async function listReceivedInvitationsAction(
  params: ListReceivedInvitationsParams = {},
): Promise<ListReceivedInvitationsResult> {
  const parsed = parseOrFail(listReceivedInvitationsSchema, params);
  if (!parsed.ok) {
    return parsed;
  }

  const auth = await requireUser();
  if (!auth.ok) {
    return auth;
  }

  const { supabase } = auth;
  const { cursor, limit = DEFAULT_LIMIT } = parsed.data;
  const listReceivedInvitationsRpc = 'list_received_invitations_with_cursor' as never;
  const listReceivedInvitationsParams = {
    p_limit: limit,
    p_cursor_created_time: cursor?.createdTime ?? null,
    p_cursor_invitation_id: cursor?.invitationId ?? null,
  } as never;
  const { data, error } = await supabase.rpc(
    listReceivedInvitationsRpc,
    listReceivedInvitationsParams,
  );

  if (error) {
    return actionError('server-error', '알림 목록을 불러오지 못했습니다.');
  }

  const rows = ((data as InvitationRow[] | null) ?? []).filter(
    (row) => row.invitation_id && row.group_id,
  );

  if (rows.length === 0) {
    return actionSuccess({
      invitations: [],
      nextCursor: null,
    });
  }

  const hasMore = rows.length > limit;
  const visibleRows = hasMore ? rows.slice(0, limit) : rows;
  const lastRow = visibleRows[visibleRows.length - 1];

  const invitations: InvitationListItem[] = visibleRows.map((row) => ({
    invitationId: row.invitation_id,
    type: row.type,
    status: row.status,
    createdTime: row.created_time,
    inviterId: row.inviter_id ?? '',
    inviterName: row.inviter_name ?? null,
    inviterNickname: row.inviter_nickname ?? null,
    inviterProfileImage: row.inviter_profile_image ?? null,
    groupId: row.group_id,
    groupName: row.group_name ?? null,
    appointmentId: row.appointment_id,
    appointmentTitle: row.appointment_title ?? null,
    appointmentEndsAt: row.appointment_ends_at ?? null,
  }));

  return actionSuccess({
    invitations,
    nextCursor: hasMore && lastRow
      ? {
          createdTime: lastRow.created_time,
          invitationId: lastRow.invitation_id,
        }
      : null,
  });
}
