'use server';

import { createSupabaseServerClient } from '@/libs/supabase/server';
import { groupSearchSchema } from '@/schemas/group';

import { mapGroup, type SearchGroupsResult } from './_shared';

export async function searchGroupsAction(
  query: string,
): Promise<SearchGroupsResult> {
  const parsed = groupSearchSchema.safeParse(query);

  if (!parsed.success) {
    const firstError = parsed.error.issues[0];
    return {
      ok: false,
      error: 'invalid-format',
      message: firstError?.message || '검색어를 입력해주세요.',
    };
  }

  const supabase = createSupabaseServerClient();
  const normalizedQuery = parsed.data;

  const { data, error } = await supabase
    .from('groups')
    .select('group_id, name')
    .ilike('name', `%${normalizedQuery}%`)
    .order('name')
    .limit(6);

  if (error) {
    return {
      ok: false,
      error: 'server-error',
      message: '그룹 검색 중 오류가 발생했습니다.',
    };
  }

  return {
    ok: true,
    data: {
      groups: (data || []).map(mapGroup),
    },
  };
}
