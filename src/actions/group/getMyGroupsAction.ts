'use server';

import { requireUser } from '@/actions/_common/guards';
import { actionError, actionSuccess } from '@/actions/_common/result';

import { mapGroup, type GetMyGroupsResult } from './_shared';

export async function getMyGroupsAction(): Promise<GetMyGroupsResult> {
  const auth = await requireUser();
  if (!auth.ok) {
    return auth;
  }
  const { supabase, user } = auth;

  const { data, error } = await supabase
    .from('group_members')
    .select('group_id, groups(name)')
    .eq('user_id', user.id)
    .order('joined_at', { ascending: false });

  if (error) {
    return actionError('server-error', '그룹 정보를 불러올 수 없습니다.');
  }

  const groups = (data || [])
    .map(
      (row) =>
        ({
          group_id: row.group_id,
          name: row.groups?.name ?? '알 수 없음',
        }) as { group_id: string; name: string },
    )
    .map(mapGroup);

  return actionSuccess({ groups });
}
