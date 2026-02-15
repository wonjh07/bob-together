'use server';

import { createSupabaseServerClient } from '@/libs/supabase/server';

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

export async function listMyGroupsWithStatsAction(
  params: ListMyGroupsWithStatsParams = {},
): Promise<ListMyGroupsWithStatsResult> {
  const supabase = createSupabaseServerClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    return {
      ok: false,
      error: 'unauthorized',
      message: '로그인이 필요합니다.',
    };
  }

  const limit = Math.min(Math.max(params.limit ?? DEFAULT_LIMIT, 1), MAX_LIMIT);
  const cursor = params.cursor ?? null;

  const { data, error } = await supabase.rpc('list_my_groups_with_stats', {
    p_user_id: userData.user.id,
    p_limit: limit,
    p_cursor_joined_at: cursor?.joinedAt ?? undefined,
    p_cursor_group_id: cursor?.groupId ?? undefined,
  });

  if (error) {
    return {
      ok: false,
      error: 'server-error',
      message: '그룹 관리 목록을 불러오지 못했습니다.',
    };
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

  return {
    ok: true,
    data: {
      groups,
      nextCursor,
    },
  };
}
