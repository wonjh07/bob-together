'use server';

import { z } from 'zod';

import { requireUserService } from '@/actions/_common/guards';
import {
  createActionSuccessState,
  createActionErrorState,
  runServiceAction,
  toActionResult,
} from '@/actions/_common/service-action';

import type { LeaveGroupResult } from './_shared';

export async function leaveGroupAction(groupId: string): Promise<LeaveGroupResult> {
  const state = await runServiceAction({
    serverErrorMessage: '그룹 탈퇴에 실패했습니다.',
    run: async ({ requestId }) => {
      if (!groupId) {
        return createActionErrorState({
          requestId,
          code: 'validation',
          message: '그룹 정보가 필요합니다.',
        });
      }
      if (!z.string().uuid().safeParse(groupId).success) {
        return createActionErrorState({
          requestId,
          code: 'validation',
          message: '유효한 그룹 ID가 아닙니다.',
        });
      }

      const auth = await requireUserService(requestId);
      if (!('supabase' in auth)) {
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
        return createActionErrorState({
          requestId,
          code: 'server',
          message: '그룹 탈퇴에 실패했습니다.',
          error: error ?? { message: 'missing-rpc-row' },
        });
      }

      if (!row.ok) {
        if (row.error_code === 'forbidden-owner') {
          return createActionErrorState({
            requestId,
            code: 'permission',
            message: '그룹장은 그룹을 탈퇴할 수 없습니다.',
          });
        }

        if (row.error_code === 'invalid-format') {
          return createActionErrorState({
            requestId,
            code: 'validation',
            message: '그룹 정보가 필요합니다.',
          });
        }

        if (row.error_code === 'forbidden') {
          return createActionErrorState({
            requestId,
            code: 'permission',
            message: '그룹 탈퇴 권한이 없습니다.',
          });
        }

        return createActionErrorState({
          requestId,
          code: 'server',
          message: '그룹 탈퇴에 실패했습니다.',
          error: { rpcErrorCode: row.error_code },
        });
      }

      return createActionSuccessState({
        requestId,
        data: { groupId: row.group_id ?? groupId },
      });
    },
  });

  return toActionResult(state);
}
