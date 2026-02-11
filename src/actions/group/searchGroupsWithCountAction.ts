'use server';

import { createSupabaseServerClient } from '@/libs/supabase/server';
import { groupSearchSchema } from '@/schemas/group';

import type {
  GroupSearchCursor,
  GroupSearchItem,
  SearchGroupsWithCountResult,
} from './_shared';

interface SearchGroupsWithCountParams {
  query: string;
  cursor?: GroupSearchCursor | null;
  limit?: number;
}

interface SearchGroupsWithCountRow {
  group_id: string;
  group_name: string;
  owner_name: string | null;
  owner_nickname: string | null;
  member_count: number;
  is_member: boolean;
}

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 30;

export async function searchGroupsWithCountAction(
  params: SearchGroupsWithCountParams,
): Promise<SearchGroupsWithCountResult> {
  const parsed = groupSearchSchema.safeParse(params.query);

  if (!parsed.success) {
    const firstError = parsed.error.issues[0];
    return {
      ok: false,
      error: 'invalid-format',
      message: firstError?.message || '검색어를 입력해주세요.',
    };
  }

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

  const { data, error } = await supabase.rpc('search_groups_with_count', {
    p_user_id: userData.user.id,
    p_query: parsed.data,
    p_limit: limit,
    p_cursor_name: cursor?.name ?? undefined,
    p_cursor_group_id: cursor?.groupId ?? undefined,
  });

  if (error) {
    return {
      ok: false,
      error: 'server-error',
      message: '그룹 검색 중 오류가 발생했습니다.',
    };
  }

  const rows = ((data as SearchGroupsWithCountRow[] | null) ?? []).filter(
    (row) => row.group_id && row.group_name,
  );

  const hasMore = rows.length > limit;
  const visibleRows = hasMore ? rows.slice(0, limit) : rows;
  const lastRow = visibleRows[visibleRows.length - 1];

  const groups: GroupSearchItem[] = visibleRows.map((row) => ({
    groupId: row.group_id,
    title: row.group_name,
    name: row.owner_nickname || row.owner_name || '알 수 없음',
    memberCount: Number(row.member_count) || 0,
    isMember: row.is_member,
  }));

  const nextCursor: GroupSearchCursor | null =
    hasMore && lastRow
      ? {
          name: lastRow.group_name,
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
