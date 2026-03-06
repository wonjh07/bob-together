'use server';

import { requireUserService } from '@/actions/_common/guards';
import {
  createActionSuccessState,
  createActionErrorState,
  runServiceAction,
  toActionResult,
} from '@/actions/_common/service-action';

import type { InvitationIndicatorResult } from './types';

export async function getInvitationIndicatorAction(): Promise<InvitationIndicatorResult> {
  const state = await runServiceAction({
    serverErrorMessage: '알림 상태를 확인하지 못했습니다.',
    run: async ({ requestId }) => {
      const auth = await requireUserService(requestId);
      if (!('supabase' in auth)) {
        return auth;
      }

      const { supabase, user } = auth;
      const unreadInvitationsRpc = 'has_unread_invitations' as never;
      const unreadInvitationsParams = {
        p_user_id: user.id,
      } as never;
      const { data, error } = await supabase.rpc(
        unreadInvitationsRpc,
        unreadInvitationsParams,
      );

      if (error) {
        return createActionErrorState({
          requestId,
          code: 'server',
          message: '알림 상태를 확인하지 못했습니다.',
          error,
        });
      }

      return createActionSuccessState({
        requestId,
        data: {
          hasUnreadInvitations: Boolean(data),
        },
      });
    },
  });

  return toActionResult(state);
}
