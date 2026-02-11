'use server';

import { createSupabaseServerClient } from '@/libs/supabase/server';

import { mapGroup, type GetGroupResult } from './_shared';

export async function getGroupByIdAction(
  groupId: string,
): Promise<GetGroupResult> {
  if (!groupId) {
    return {
      ok: false,
      error: 'invalid-format',
      message: '그룹 정보가 필요합니다.',
    };
  }

  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from('groups')
    .select('group_id, name')
    .eq('group_id', groupId)
    .maybeSingle();

  if (error || !data) {
    return {
      ok: false,
      error: 'group-not-found',
      message: '그룹을 찾을 수 없습니다.',
    };
  }

  return {
    ok: true,
    data: mapGroup(data),
  };
}
