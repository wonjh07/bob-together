'use server';

import { createSupabaseServerClient } from '@/libs/supabase/server';

import type { LeaveGroupResult } from './_shared';

export async function leaveGroupAction(groupId: string): Promise<LeaveGroupResult> {
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

  const { data: membership, error: membershipError } = await supabase
    .from('group_members')
    .select('role')
    .eq('group_id', groupId)
    .eq('user_id', userData.user.id)
    .maybeSingle();

  if (membershipError) {
    return {
      ok: false,
      error: 'server-error',
      message: '그룹 가입 상태를 확인할 수 없습니다.',
    };
  }

  if (!membership) {
    return {
      ok: true,
      data: { groupId },
    };
  }

  if (membership.role === 'owner') {
    return {
      ok: false,
      error: 'forbidden',
      message: '그룹장은 그룹을 탈퇴할 수 없습니다.',
    };
  }

  const { error: leaveError } = await supabase
    .from('group_members')
    .delete()
    .eq('group_id', groupId)
    .eq('user_id', userData.user.id);

  if (leaveError) {
    return {
      ok: false,
      error: 'server-error',
      message: '그룹 탈퇴에 실패했습니다.',
    };
  }

  return {
    ok: true,
    data: { groupId },
  };
}
