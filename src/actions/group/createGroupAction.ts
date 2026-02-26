'use server';

import { requireUser } from '@/actions/_common/guards';
import { actionError, actionSuccess } from '@/actions/_common/result';
import { groupNameSchema } from '@/schemas/group';

import { mapGroup, type CreateGroupResult } from './_shared';

interface CreateGroupRpcRow {
  ok: boolean;
  error_code: string | null;
  group_id: string | null;
  group_name: string | null;
}

export async function createGroupAction(
  groupName: string,
): Promise<CreateGroupResult> {
  const parsed = groupNameSchema.safeParse(groupName);

  if (!parsed.success) {
    const firstError = parsed.error.issues[0];
    return actionError('invalid-format', firstError?.message || '그룹명을 입력해주세요.');
  }

  const auth = await requireUser();
  if (!auth.ok) {
    return auth;
  }
  const { supabase, user } = auth;

  const createGroupRpc = 'create_group_transactional' as never;
  const createGroupRpcParams = {
    p_owner_id: user.id,
    p_group_name: parsed.data,
  } as never;
  const { data, error } = await supabase.rpc(createGroupRpc, createGroupRpcParams);

  if (error) {
    if (error.code === '42501') {
      return actionError('forbidden', '그룹 생성 권한이 없습니다.');
    }
    return actionError('server-error', '그룹 생성 중 오류가 발생했습니다.');
  }

  const row = ((data as CreateGroupRpcRow[] | null) ?? [])[0] ?? null;
  if (!row) {
    return actionError('server-error', '그룹 생성 중 오류가 발생했습니다.');
  }

  if (!row.ok) {
    switch (row.error_code) {
      case 'group-name-taken':
        return actionError('group-name-taken', '이미 존재하는 그룹명입니다.');
      case 'invalid-format':
        return actionError('invalid-format', '그룹명을 입력해주세요.');
      case 'forbidden':
        return actionError('forbidden', '그룹 생성 권한이 없습니다.');
      default:
        return actionError('server-error', '그룹 생성 중 오류가 발생했습니다.');
    }
  }

  if (!row.group_id || !row.group_name) {
    return actionError('server-error', '그룹 생성 중 오류가 발생했습니다.');
  }

  return actionSuccess(
    mapGroup({
      group_id: row.group_id,
      name: row.group_name,
    }),
  );
}
