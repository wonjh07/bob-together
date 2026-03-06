'use server';

import {
  createActionSuccessState,
  createActionErrorState,
  runServiceAction,
  toActionResult,
  createZodValidationErrorState,
} from '@/actions/_common/service-action';
import { createSupabaseServerClient } from '@/libs/supabase/server';
import { groupNameSchema } from '@/schemas/group';

import { mapGroup, type FindGroupResult } from './_shared';

export async function findGroupByNameAction(
  groupName: string,
): Promise<FindGroupResult> {
  const state = await runServiceAction({
    serverErrorMessage: '그룹을 찾는 중 오류가 발생했습니다.',
    run: async ({ requestId }) => {
      const parsed = groupNameSchema.safeParse(groupName);
      if (!parsed.success) {
        return createZodValidationErrorState({
          requestId,
          error: parsed.error,
          fallbackMessage: '그룹명을 입력해주세요.',
        });
      }

      const supabase = createSupabaseServerClient();
      const normalizedName = parsed.data;
      const { data, error } = await supabase
        .from('groups')
        .select('group_id, name')
        .eq('name', normalizedName)
        .limit(2);

      if (error) {
        return createActionErrorState({
          requestId,
          code: 'server',
          message: '그룹을 찾는 중 오류가 발생했습니다.',
          error,
        });
      }

      if (!data || data.length === 0) {
        return createActionErrorState({
          requestId,
          code: 'not_found',
          message: '해당 그룹을 찾을 수 없습니다.',
        });
      }

      if (data.length > 1) {
        return createActionErrorState({
          requestId,
          code: 'conflict',
          message: '동일한 그룹명이 여러 개 존재합니다.',
        });
      }

      return createActionSuccessState({
        requestId,
        data: mapGroup(data[0]),
      });
    },
  });

  return toActionResult(state);
}
