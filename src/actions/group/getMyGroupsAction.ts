'use server';

import { createSupabaseServerClient } from '@/libs/supabase/server';

import { mapGroup, type GetMyGroupsResult } from './_shared';

export async function getMyGroupsAction(): Promise<GetMyGroupsResult> {
  const supabase = createSupabaseServerClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    return {
      ok: false,
      error: 'unauthorized',
      message: '로그인이 필요합니다.',
    };
  }

  const { data, error } = await supabase
    .from('group_members')
    .select('group_id, groups(name)')
    .eq('user_id', userData.user.id)
    .order('joined_at', { ascending: false });

  if (error) {
    return {
      ok: false,
      error: 'server-error',
      message: '그룹 정보를 불러올 수 없습니다.',
    };
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

  return {
    ok: true,
    data: { groups },
  };
}
