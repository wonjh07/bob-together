'use server';

import {
  createActionSuccessState,
  createActionErrorState,
  runServiceAction,
  toActionResult,
  createZodValidationErrorState,
} from '@/actions/_common/service-action';
import { createSupabaseServerClient } from '@/libs/supabase/server';
import { groupSearchSchema } from '@/schemas/group';

import { mapGroup, type SearchGroupsResult } from './_shared';

export async function searchGroupsAction(
  query: string,
): Promise<SearchGroupsResult> {
  const state = await runServiceAction({
    serverErrorMessage: '그룹 검색 중 오류가 발생했습니다.',
    run: async ({ requestId }) => {
      const parsed = groupSearchSchema.safeParse(query);

      if (!parsed.success) {
        return createZodValidationErrorState({
          requestId,
          error: parsed.error,
          fallbackMessage: '검색어를 입력해주세요.',
        });
      }

      const supabase = createSupabaseServerClient();
      const normalizedQuery = parsed.data;

      const { data, error } = await supabase
        .from('groups')
        .select('group_id, name')
        .ilike('name', `%${normalizedQuery}%`)
        .order('name')
        .limit(6);

      if (error) {
        return createActionErrorState({
          requestId,
          code: 'server',
          message: '그룹 검색 중 오류가 발생했습니다.',
          error,
        });
      }

      return createActionSuccessState({
        requestId,
        data: {
          groups: (data || []).map(mapGroup),
        },
      });
    },
  });

  return toActionResult(state);
}
