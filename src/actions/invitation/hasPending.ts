'use server';

import { requireUser } from '@/actions/_common/guards';
import { actionError, actionSuccess } from '@/actions/_common/result';

import type { HasPendingInvitationsResult } from './types';

export async function hasPendingInvitationsAction(): Promise<HasPendingInvitationsResult> {
  const auth = await requireUser();
  if (!auth.ok) {
    return auth;
  }

  const { supabase, user } = auth;
  const { count, error } = await supabase
    .from('invitations')
    .select('invitation_id', { count: 'exact', head: true })
    .eq('invitee_id', user.id)
    .eq('status', 'pending');

  if (error) {
    return actionError('server-error', '알림 상태를 확인하지 못했습니다.');
  }

  return actionSuccess({
    hasPendingInvitations: (count ?? 0) > 0,
  });
}
