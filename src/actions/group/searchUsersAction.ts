'use server';

import { requireUserService } from '@/actions/_common/guards';
import {
  createActionSuccessState,
  createActionErrorState,
  runServiceAction,
  toActionResult,
  createZodValidationErrorState,
} from '@/actions/_common/service-action';
import { groupSearchSchema } from '@/schemas/group';

import { mapUser, type SearchUsersResult } from './_shared';

export async function searchUsersAction(
  query: string,
): Promise<SearchUsersResult> {
  const state = await runServiceAction({
    serverErrorMessage: '사용자 검색 중 오류가 발생했습니다.',
    run: async ({ requestId }) => {
      const parsed = groupSearchSchema.safeParse(query);

      if (!parsed.success) {
        return createZodValidationErrorState({
          requestId,
          error: parsed.error,
          fallbackMessage: '검색어를 입력해주세요.',
        });
      }

      const auth = await requireUserService(requestId);
      if (!('supabase' in auth)) {
        return auth;
      }
      const { supabase, user } = auth;

      const normalizedQuery = parsed.data;
      const { data, error } = await supabase
        .from('users')
        .select('user_id, name, nickname, profile_image')
        .or(`nickname.ilike.%${normalizedQuery}%,name.ilike.%${normalizedQuery}%`)
        .neq('user_id', user.id)
        .limit(6);

      if (error) {
        return createActionErrorState({
          requestId,
          code: 'server',
          message: '사용자 검색 중 오류가 발생했습니다.',
          error,
        });
      }

      return createActionSuccessState({
        requestId,
        data: {
          users: (data || []).map(mapUser),
        },
      });
    },
  });

  return toActionResult(state);
}
