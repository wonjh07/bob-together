'use server';

import { z } from 'zod';

import { requireUserService } from '@/actions/_common/guards';
import {
  createActionSuccessState,
  createActionErrorState,
  createPostgrestErrorState,
  createZodValidationErrorState,
  runServiceAction,
  toActionResult,
} from '@/actions/_common/service-action';

import type { JoinGroupResult } from './_shared';

interface JoinGroupRpcRow {
  ok: boolean;
  error_code: string | null;
  group_id: string | null;
}

const joinGroupSchema = z.object({
  groupId: z.string().uuid('유효한 그룹 ID가 아닙니다.'),
});

export async function joinGroupAction(
  groupId: string,
): Promise<JoinGroupResult> {
  const state = await runServiceAction({
    serverErrorMessage: '그룹 가입 중 오류가 발생했습니다.',
    run: async ({ requestId }) => {
      if (!groupId) {
        return createActionErrorState({
          requestId,
          code: 'validation',
          message: '그룹 정보가 필요합니다.',
        });
      }

      const parsed = joinGroupSchema.safeParse({ groupId });
      if (!parsed.success) {
        return createZodValidationErrorState({
          requestId,
          error: parsed.error,
          fallbackMessage: '유효한 그룹 ID가 아닙니다.',
        });
      }

      const auth = await requireUserService(requestId);
      if (!('supabase' in auth)) {
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
        return createPostgrestErrorState({
          requestId,
          error,
          permissionCodes: ['42501'],
          permissionMessage: '그룹 가입 권한이 없습니다.',
          permissionExtra: {},
          serverMessage: '그룹 가입 중 오류가 발생했습니다.',
        });
      }

      const row = ((data as JoinGroupRpcRow[] | null) ?? [])[0] ?? null;
      if (!row) {
        return createActionErrorState({
          requestId,
          code: 'server',
          message: '그룹 가입 중 오류가 발생했습니다.',
        });
      }

      if (!row.ok) {
        switch (row.error_code) {
          case 'group-not-found':
            return createActionErrorState({
              requestId,
              code: 'not_found',
              message: '그룹을 찾을 수 없습니다.',
              error: { rpcErrorCode: row.error_code },
            });
          case 'invalid-format':
            return createActionErrorState({
              requestId,
              code: 'validation',
              message: '그룹 정보가 필요합니다.',
              error: { rpcErrorCode: row.error_code },
            });
          case 'user-not-found':
            return createActionErrorState({
              requestId,
              code: 'auth',
              message: '사용자 정보를 찾을 수 없습니다. 다시 로그인해주세요.',
              error: { rpcErrorCode: row.error_code },
            });
          case 'forbidden':
            return createActionErrorState({
              requestId,
              code: 'permission',
              message: '그룹 가입 권한이 없습니다.',
              error: { rpcErrorCode: row.error_code },
            });
          default:
            return createActionErrorState({
              requestId,
              code: 'server',
              message: '그룹 가입 중 오류가 발생했습니다.',
              error: { rpcErrorCode: row.error_code },
            });
        }
      }

      return createActionSuccessState({
        requestId,
        data: { groupId: row.group_id ?? groupId },
      });
    },
  });

  return toActionResult(state);
}
