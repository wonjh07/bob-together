'use server';

import { z } from 'zod';

import { actionError, actionSuccess } from '@/actions/_common/result';
import { createSupabaseServerClient } from '@/libs/supabase/server';

import { mapGroup, type GetGroupResult } from './_shared';

export async function getGroupByIdAction(
  groupId: string,
): Promise<GetGroupResult> {
  if (!groupId) {
    return actionError('invalid-format', '그룹 정보가 필요합니다.');
  }
  if (!z.string().uuid().safeParse(groupId).success) {
    return actionError('invalid-format', '유효한 그룹 ID가 아닙니다.');
  }

  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from('groups')
    .select('group_id, name')
    .eq('group_id', groupId)
    .maybeSingle();

  if (error) {
    return actionError('server-error', '그룹 정보를 불러오지 못했습니다.');
  }

  if (!data) {
    return actionError('group-not-found', '그룹을 찾을 수 없습니다.');
  }

  return actionSuccess(mapGroup(data));
}
