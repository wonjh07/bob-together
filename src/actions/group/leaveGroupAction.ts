'use server';

import { z } from 'zod';

import { requireUser } from '@/actions/_common/guards';
import { actionError, actionSuccess } from '@/actions/_common/result';

import type { LeaveGroupResult } from './_shared';

export async function leaveGroupAction(groupId: string): Promise<LeaveGroupResult> {
  if (!groupId) {
    return actionError('invalid-format', '그룹 정보가 필요합니다.');
  }
  if (!z.string().uuid().safeParse(groupId).success) {
    return actionError('invalid-format', '유효한 그룹 ID가 아닙니다.');
  }

  const auth = await requireUser();
  if (!auth.ok) {
    return auth;
  }
  const { supabase, user } = auth;
  const leaveGroupRpc = 'leave_group_transactional' as never;
  const leaveGroupParams = {
    p_user_id: user.id,
    p_group_id: groupId,
  } as never;
  const { data, error } = await supabase.rpc(leaveGroupRpc, leaveGroupParams);
  type LeaveGroupRpcRow = {
    ok: boolean;
    error_code: string | null;
    group_id: string | null;
  };
  const row = ((data as LeaveGroupRpcRow[] | null) ?? [])[0] ?? null;

  if (error || !row) {
    return actionError('server-error', '그룹 탈퇴에 실패했습니다.');
  }

  if (!row.ok) {
    if (row.error_code === 'forbidden-owner') {
      return actionError('forbidden', '그룹장은 그룹을 탈퇴할 수 없습니다.');
    }

    if (row.error_code === 'invalid-format') {
      return actionError('invalid-format', '그룹 정보가 필요합니다.');
    }

    if (row.error_code === 'forbidden') {
      return actionError('forbidden', '그룹 탈퇴 권한이 없습니다.');
    }

    return actionError('server-error', '그룹 탈퇴에 실패했습니다.');
  }

  return actionSuccess({ groupId: row.group_id ?? groupId });
}
