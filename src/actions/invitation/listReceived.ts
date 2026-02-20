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
      offset: z.number().int().min(0, '유효한 offset이 아닙니다.'),
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
  inviter: {
    user_id: string;
    name: string | null;
    nickname: string | null;
    profile_image: string | null;
  } | null;
  group: {
    name: string | null;
  } | null;
  appointment: {
    title: string | null;
    ends_at: string | null;
  } | null;
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

  const { supabase, user } = auth;
  const { cursor, limit = DEFAULT_LIMIT } = parsed.data;
  const offset = cursor?.offset ?? 0;

  const { data, error } = await supabase
    .from('invitations')
    .select(
      `
      invitation_id,
      type,
      status,
      created_time,
      group_id,
      appointment_id,
      inviter:users!invitations_inviter_id_fkey(
        user_id,
        name,
        nickname,
        profile_image
      ),
      group:groups!invitations_group_id_fkey(
        name
      ),
      appointment:appointments!invitations_appointment_id_fkey(
        title,
        ends_at
      )
      `,
    )
    .eq('invitee_id', user.id)
    .in('status', ['pending', 'accepted', 'rejected'])
    .order('created_time', { ascending: false })
    .order('invitation_id', { ascending: false })
    .range(offset, offset + limit);

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

  const invitations: InvitationListItem[] = visibleRows.map((row) => ({
    invitationId: row.invitation_id,
    type: row.type,
    status: row.status,
    createdTime: row.created_time,
    inviterId: row.inviter?.user_id ?? '',
    inviterName: row.inviter?.name ?? null,
    inviterNickname: row.inviter?.nickname ?? null,
    inviterProfileImage: row.inviter?.profile_image ?? null,
    groupId: row.group_id,
    groupName: row.group?.name ?? null,
    appointmentId: row.appointment_id,
    appointmentTitle: row.appointment?.title ?? null,
    appointmentEndsAt: row.appointment?.ends_at ?? null,
  }));

  return actionSuccess({
    invitations,
    nextCursor: hasMore
      ? {
          offset: offset + limit,
        }
      : null,
  });
}
