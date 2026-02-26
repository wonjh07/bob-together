'use server';

import { z } from 'zod';

import { parseOrFail, requireUser } from '@/actions/_common/guards';
import { actionError, actionSuccess } from '@/actions/_common/result';

import type {
  GroupManageCursor,
  GroupManageItem,
  ListMyGroupsWithStatsResult,
} from './_shared';

interface ListMyGroupsWithStatsParams {
  cursor?: GroupManageCursor | null;
  limit?: number;
}

interface ListMyGroupsWithStatsRow {
  group_id: string;
  group_name: string;
  owner_name: string | null;
  owner_nickname: string | null;
  owner_profile_image: string | null;
  joined_at: string;
  created_at: string;
  member_count: number;
  is_owner: boolean;
}

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 30;
const listMyGroupsWithStatsSchema = z.object({
  cursor: z
    .object({
      joinedAt: z.string().datetime({
        offset: true,
        message: '유효한 커서 정보가 아닙니다.',
      }),
      groupId: z.string().uuid('유효한 커서 정보가 아닙니다.'),
    })
    .nullable()
    .optional(),
  limit: z.number().int().min(1).max(MAX_LIMIT).optional().default(DEFAULT_LIMIT),
});

export async function listMyGroupsWithStatsAction(
  params: ListMyGroupsWithStatsParams = {},
): Promise<ListMyGroupsWithStatsResult> {
  const parsed = parseOrFail(listMyGroupsWithStatsSchema, params);
  if (!parsed.ok) {
    return parsed;
  }

  const auth = await requireUser();
  if (!auth.ok) {
    return auth;
  }
  const { supabase, user } = auth;

  const { limit, cursor } = parsed.data;

  const { data, error } = await supabase.rpc('list_my_groups_with_stats', {
    p_user_id: user.id,
    p_limit: limit,
    p_cursor_joined_at: cursor?.joinedAt ?? undefined,
    p_cursor_group_id: cursor?.groupId ?? undefined,
  });

  if (error) {
    return actionError('server-error', '그룹 관리 목록을 불러오지 못했습니다.');
  }

  const rows = ((data as ListMyGroupsWithStatsRow[] | null) ?? []).filter(
    (row) => row.group_id && row.group_name && row.joined_at,
  );

  const hasMore = rows.length > limit;
  const visibleRows = hasMore ? rows.slice(0, limit) : rows;
  const lastRow = visibleRows[visibleRows.length - 1];

  const groups: GroupManageItem[] = visibleRows.map((row) => ({
    groupId: row.group_id,
    groupName: row.group_name,
    ownerName: row.owner_name,
    ownerNickname: row.owner_nickname,
    ownerProfileImage: row.owner_profile_image,
    joinedAt: row.joined_at,
    createdAt: row.created_at,
    memberCount: Number(row.member_count) || 0,
    isOwner: row.is_owner,
  }));

  const nextCursor: GroupManageCursor | null =
    hasMore && lastRow
      ? {
          joinedAt: lastRow.joined_at,
          groupId: lastRow.group_id,
        }
      : null;

  return actionSuccess({
    groups,
    nextCursor,
  });
}
