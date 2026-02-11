'use server';

import { createSupabaseServerClient } from '@/libs/supabase/server';
import { groupNameSchema } from '@/schemas/group';

import { mapGroup, type FindGroupResult } from './_shared';

export async function findGroupByNameAction(
  groupName: string,
): Promise<FindGroupResult> {
  const parsed = groupNameSchema.safeParse(groupName);

  if (!parsed.success) {
    const firstError = parsed.error.issues[0];
    return {
      ok: false,
      error: 'invalid-format',
      message: firstError?.message || '그룹명을 입력해주세요.',
    };
  }

  const supabase = createSupabaseServerClient();
  const normalizedName = parsed.data;

  const { data, error } = await supabase
    .from('groups')
    .select('group_id, name')
    .eq('name', normalizedName)
    .limit(2);

  if (error) {
    return {
      ok: false,
      error: 'server-error',
      message: '그룹을 찾는 중 오류가 발생했습니다.',
    };
  }

  if (!data || data.length === 0) {
    return {
      ok: false,
      error: 'group-not-found',
      message: '해당 그룹을 찾을 수 없습니다.',
    };
  }

  if (data.length > 1) {
    return {
      ok: false,
      error: 'group-name-duplicated',
      message: '동일한 그룹명이 여러 개 존재합니다.',
    };
  }

  return {
    ok: true,
    data: mapGroup(data[0]),
  };
}
