'use server';

import { requireUserService } from '@/actions/_common/guards';
import {
  createActionSuccessState,
  createActionErrorState,
  runServiceAction,
  toActionResult,
} from '@/actions/_common/service-action';

import type { HasPendingInvitationsResult } from './types';

export async function hasPendingInvitationsAction(): Promise<HasPendingInvitationsResult> {
  const state = await runServiceAction({
    serverErrorMessage: '알림 상태를 확인하지 못했습니다.',
    run: async ({ requestId }) => {
      const auth = await requireUserService(requestId);
      if (!('supabase' in auth)) {
        return auth;
      }

      const { supabase, user } = auth;
      const { count, error } = await supabase
        .from('invitations')
        .select('invitation_id', { count: 'exact', head: true })
        .eq('invitee_id', user.id)
        .eq('status', 'pending');

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
          hasPendingInvitations: (count ?? 0) > 0,
        },
      });
    },
  });

  return toActionResult(state);
}
