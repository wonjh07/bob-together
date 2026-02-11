'use server';

import { createSupabaseServerClient } from '@/libs/supabase/server';

import type { JoinGroupResult } from './_shared';

export async function joinGroupAction(
  groupId: string,
): Promise<JoinGroupResult> {
  if (!groupId) {
    return {
      ok: false,
      error: 'invalid-format',
      message: '그룹 정보가 필요합니다.',
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

  const { data: groupData, error: groupError } = await supabase
    .from('groups')
    .select('group_id')
    .eq('group_id', groupId)
    .maybeSingle();

  if (groupError || !groupData) {
    return {
      ok: false,
      error: 'group-not-found',
      message: '그룹을 찾을 수 없습니다.',
    };
  }

  const { data: memberData, error: memberCheckError } = await supabase
    .from('group_members')
    .select('group_id')
    .eq('group_id', groupId)
    .eq('user_id', userData.user.id)
    .maybeSingle();

  if (memberCheckError) {
    return {
      ok: false,
      error: 'server-error',
      message: '그룹 상태를 확인할 수 없습니다.',
    };
  }

  if (memberData) {
    return {
      ok: true,
      data: { groupId },
    };
  }

  const { error: joinError } = await supabase.from('group_members').insert({
    group_id: groupId,
    user_id: userData.user.id,
    role: 'member',
  });

  if (joinError) {
    return {
      ok: false,
      error: 'server-error',
      message: '그룹 가입 중 오류가 발생했습니다.',
    };
  }

  return {
    ok: true,
    data: { groupId },
  };
}
