'use server';

import { z } from 'zod';

import { withDevErrorDetails } from '@/actions/_common/devError';
import { requireUser } from '@/actions/_common/guards';
import { actionError, actionSuccess } from '@/actions/_common/result';

import type { JoinGroupResult } from './_shared';

interface JoinGroupRpcRow {
  ok: boolean;
  error_code: string | null;
  group_id: string | null;
}

function withDevRpcCode(baseMessage: string, errorCode?: string | null): string {
  if (process.env.NODE_ENV !== 'development' || !errorCode) {
    return baseMessage;
  }
  return `${baseMessage} [rpc_error_code=${errorCode}]`;
}

export async function joinGroupAction(
  groupId: string,
): Promise<JoinGroupResult> {
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

  const joinGroupRpc = 'join_group_transactional' as never;
  const joinGroupRpcParams = {
    p_user_id: user.id,
    p_group_id: groupId,
  } as never;
  const { data, error } = await supabase.rpc(joinGroupRpc, joinGroupRpcParams);

  if (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[joinGroupAction] rpc error', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      });
    }

    if (error.code === '42501') {
      return actionError('forbidden', '그룹 가입 권한이 없습니다.');
    }
    return actionError(
      'server-error',
      withDevErrorDetails('그룹 가입 중 오류가 발생했습니다.', error),
    );
  }

  const row = ((data as JoinGroupRpcRow[] | null) ?? [])[0] ?? null;
  if (!row) {
    return actionError('server-error', '그룹 가입 중 오류가 발생했습니다.');
  }

  if (!row.ok) {
    switch (row.error_code) {
      case 'group-not-found':
        return actionError(
          'group-not-found',
          withDevRpcCode('그룹을 찾을 수 없습니다.', row.error_code),
        );
      case 'invalid-format':
        return actionError(
          'invalid-format',
          withDevRpcCode('그룹 정보가 필요합니다.', row.error_code),
        );
      case 'user-not-found':
        return actionError(
          'unauthorized',
          withDevRpcCode(
            '사용자 정보를 찾을 수 없습니다. 다시 로그인해주세요.',
            row.error_code,
          ),
        );
      case 'forbidden':
        return actionError(
          'forbidden',
          withDevRpcCode('그룹 가입 권한이 없습니다.', row.error_code),
        );
      default:
        return actionError(
          'server-error',
          withDevRpcCode('그룹 가입 중 오류가 발생했습니다.', row.error_code),
        );
    }
  }

  return actionSuccess({ groupId: row.group_id ?? groupId });
}
