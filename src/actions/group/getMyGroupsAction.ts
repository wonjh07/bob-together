'use server';

import { requireUserService } from '@/actions/_common/guards';
import {
  createActionSuccessState,
  createActionErrorState,
  runServiceAction,
  toActionResult,
} from '@/actions/_common/service-action';

import { mapGroup, type GetMyGroupsResult } from './_shared';

export async function getMyGroupsAction(): Promise<GetMyGroupsResult> {
  const state = await runServiceAction({
    serverErrorMessage: '그룹 정보를 불러올 수 없습니다.',
    run: async ({ requestId }) => {
      const auth = await requireUserService(requestId);
      if (!('supabase' in auth)) {
        return auth;
      }
      const { supabase, user } = auth;

      const { data, error } = await supabase
        .from('group_members')
        .select('group_id, groups(name)')
        .eq('user_id', user.id)
        .order('joined_at', { ascending: false });

      if (error) {
        return createActionErrorState({
          requestId,
          code: 'server',
          message: '그룹 정보를 불러올 수 없습니다.',
          error,
        });
      }

      const groups = (data || [])
        .map(
          (row) =>
            ({
              group_id: row.group_id,
              name: row.groups?.name ?? '알 수 없음',
            }) as { group_id: string; name: string },
        )
        .map(mapGroup);

      return createActionSuccessState({
        requestId,
        data: { groups },
      });
    },
  });

  return toActionResult(state);
}
