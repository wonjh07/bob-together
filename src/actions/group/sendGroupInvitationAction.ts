'use server';

import { createSupabaseServerClient } from '@/libs/supabase/server';

import type { SendInvitationResult } from './_shared';

export async function sendGroupInvitationAction(
  groupId: string,
  inviteeId: string,
): Promise<SendInvitationResult> {
  if (!groupId || !inviteeId) {
    return {
      ok: false,
      error: 'invalid-format',
      message: '초대 정보가 부족합니다.',
    };
  }

  const supabase = createSupabaseServerClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    return {
      ok: false,
      error: 'unauthorized',
      message: '로그인이 필요합니다.',
    };
  }

  if (userData.user.id === inviteeId) {
    return {
      ok: false,
      error: 'invalid-format',
      message: '본인은 초대할 수 없습니다.',
    };
  }

  const { data: inviterMembership, error: inviterError } = await supabase
    .from('group_members')
    .select('role')
    .eq('group_id', groupId)
    .eq('user_id', userData.user.id)
    .maybeSingle();

  if (inviterError || !inviterMembership) {
    return {
      ok: false,
      error: 'forbidden',
      message: '그룹 멤버만 초대할 수 있습니다.',
    };
  }

  const { data: existingMember } = await supabase
    .from('group_members')
    .select('user_id')
    .eq('group_id', groupId)
    .eq('user_id', inviteeId)
    .maybeSingle();

  if (existingMember) {
    return {
      ok: false,
      error: 'already-member',
      message: '이미 그룹에 가입된 사용자입니다.',
    };
  }

  const { data: existingInvite } = await supabase
    .from('invitations')
    .select('invitation_id')
    .eq('group_id', groupId)
    .eq('invitee_id', inviteeId)
    .eq('type', 'group')
    .eq('status', 'pending')
    .maybeSingle();

  if (existingInvite) {
    return {
      ok: false,
      error: 'invite-already-sent',
      message: '이미 초대가 발송되었습니다.',
    };
  }

  const { error: inviteError } = await supabase.from('invitations').insert({
    group_id: groupId,
    inviter_id: userData.user.id,
    invitee_id: inviteeId,
    type: 'group',
    status: 'pending',
  });

  if (inviteError) {
    return {
      ok: false,
      error: 'server-error',
      message: '초대 전송 중 오류가 발생했습니다.',
    };
  }

  return { ok: true };
}
