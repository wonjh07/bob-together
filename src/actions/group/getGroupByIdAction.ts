'use server';

import { z } from 'zod';

import {
  createActionSuccessState,
  createActionErrorState,
  runServiceAction,
  toActionResult,
} from '@/actions/_common/service-action';
import { createSupabaseServerClient } from '@/libs/supabase/server';

import { mapGroup, type GetGroupResult } from './_shared';

export async function getGroupByIdAction(
  groupId: string,
): Promise<GetGroupResult> {
  const state = await runServiceAction({
    serverErrorMessage: '그룹 정보를 불러오지 못했습니다.',
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

      const supabase = createSupabaseServerClient();
      const { data, error } = await supabase
        .from('groups')
        .select('group_id, name')
        .eq('group_id', groupId)
        .maybeSingle();

      if (error) {
        return createActionErrorState({
          requestId,
          code: 'server',
          message: '그룹 정보를 불러오지 못했습니다.',
          error,
        });
      }

      if (!data) {
        return createActionErrorState({
          requestId,
          code: 'not_found',
          message: '그룹을 찾을 수 없습니다.',
        });
      }

      return createActionSuccessState({
        requestId,
        data: mapGroup(data),
      });
    },
  });

  return toActionResult(state);
}
