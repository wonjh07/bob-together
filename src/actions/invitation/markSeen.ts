'use server';

import { requireUserService } from '@/actions/_common/guards';
import {
  createActionSuccessState,
  createActionErrorState,
  runServiceAction,
  toActionResult,
} from '@/actions/_common/service-action';

import type { MarkInvitationIndicatorSeenResult } from './types';

export async function markInvitationIndicatorSeenAction(): Promise<MarkInvitationIndicatorSeenResult> {
  const state = await runServiceAction({
    serverErrorMessage: '알림 확인 상태를 저장하지 못했습니다.',
    run: async ({ requestId }) => {
      const auth = await requireUserService(requestId);
      if (!('supabase' in auth)) {
        return auth;
      }

      const { supabase, user } = auth;
      const markSeenRpc = 'mark_user_invitation_read_state_seen' as never;
      const markSeenParams = {
        p_user_id: user.id,
      } as never;
      const { data, error } = await supabase.rpc(markSeenRpc, markSeenParams);

      if (error) {
        return createActionErrorState({
          requestId,
          code: 'server',
          message: '알림 확인 상태를 저장하지 못했습니다.',
          error,
        });
      }

      if (!data) {
        return createActionErrorState({
          requestId,
          code: 'permission',
          message: '알림 확인 상태를 저장할 수 없습니다.',
        });
      }

      return createActionSuccessState({ requestId });
    },
  });

  return toActionResult(state);
}
