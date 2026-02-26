'use server';

import { z } from 'zod';

import { parseOrFail, requireUser } from '@/actions/_common/guards';
import { actionError, actionSuccess } from '@/actions/_common/result';
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
  owner_profile_image: string | null;
  member_count: number;
  is_member: boolean;
}

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 30;
const searchGroupsWithCountSchema = z.object({
  query: groupSearchSchema,
  cursor: z
    .object({
      name: z.string().min(1, '유효한 커서 정보가 아닙니다.'),
      groupId: z.string().uuid('유효한 커서 정보가 아닙니다.'),
    })
    .nullable()
    .optional(),
  limit: z.number().int().min(1).max(MAX_LIMIT).optional().default(DEFAULT_LIMIT),
});

export async function searchGroupsWithCountAction(
  params: SearchGroupsWithCountParams,
): Promise<SearchGroupsWithCountResult> {
  const parsed = parseOrFail(searchGroupsWithCountSchema, params);
  if (!parsed.ok) {
    return parsed;
  }
  const { query, limit, cursor } = parsed.data;

  const auth = await requireUser();
  if (!auth.ok) {
    return auth;
  }
  const { supabase, user } = auth;

  const { data, error } = await supabase.rpc('search_groups_with_count', {
    p_user_id: user.id,
    p_query: query,
    p_limit: limit,
    p_cursor_name: cursor?.name ?? undefined,
    p_cursor_group_id: cursor?.groupId ?? undefined,
  });

  if (error) {
    return actionError('server-error', '그룹 검색 중 오류가 발생했습니다.');
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
    ownerProfileImage: row.owner_profile_image,
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

  return actionSuccess({
    groups,
    nextCursor,
  });
}
