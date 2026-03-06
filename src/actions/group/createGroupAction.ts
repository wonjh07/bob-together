'use server';

import { requireUserService } from '@/actions/_common/guards';
import {
  createActionSuccessState,
  createActionErrorState,
  createPostgrestErrorState,
  createZodValidationErrorState,
  runServiceAction,
  toActionResult,
} from '@/actions/_common/service-action';
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
  const state = await runServiceAction({
    serverErrorMessage: '그룹 생성 중 오류가 발생했습니다.',
    run: async ({ requestId }) => {
      const parsed = groupNameSchema.safeParse(groupName);
      if (!parsed.success) {
        return createZodValidationErrorState({
          requestId,
          error: parsed.error,
          fallbackMessage: '그룹명을 입력해주세요.',
        });
      }

      const auth = await requireUserService(requestId);
      if (!('supabase' in auth)) {
        return auth;
      }
      const { supabase, user } = auth;

      const createGroupRpc = 'create_group_transactional' as never;
      const createGroupRpcParams = {
        p_owner_id: user.id,
        p_group_name: parsed.data,
      } as never;
      const { data, error } = await supabase.rpc(
        createGroupRpc,
        createGroupRpcParams,
      );

      if (error) {
        return createPostgrestErrorState({
          action: 'createGroupAction.rpc',
          requestId,
          error,
          permissionCodes: ['42501'],
          permissionMessage: '그룹 생성 권한이 없습니다.',
          serverMessage: '그룹 생성 중 오류가 발생했습니다.',
        });
      }

      const row = ((data as CreateGroupRpcRow[] | null) ?? [])[0] ?? null;
      if (!row) {
        return createActionErrorState({
          requestId,
          code: 'server',
          message: '그룹 생성 중 오류가 발생했습니다.',
        });
      }

      if (!row.ok) {
        switch (row.error_code) {
          case 'group-name-taken':
            return createActionErrorState({
              requestId,
              code: 'conflict',
              message: '이미 존재하는 그룹명입니다.',
              error: { rpcErrorCode: row.error_code },
            });
          case 'invalid-format':
            return createActionErrorState({
              requestId,
              code: 'validation',
              message: '그룹명을 입력해주세요.',
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
              message: '그룹 생성 권한이 없습니다.',
              error: { rpcErrorCode: row.error_code },
            });
          default:
            return createActionErrorState({
              requestId,
              code: 'server',
              message: '그룹 생성 중 오류가 발생했습니다.',
              error: { rpcErrorCode: row.error_code },
            });
        }
      }

      if (!row.group_id || !row.group_name) {
        return createActionErrorState({
          requestId,
          code: 'server',
          message: '그룹 생성 중 오류가 발생했습니다.',
        });
      }

      return createActionSuccessState({
        requestId,
        data: mapGroup({
          group_id: row.group_id,
          name: row.group_name,
        }),
      });
    },
  });

  return toActionResult(state);
}
