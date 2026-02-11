'use server';

import { createSupabaseServerClient } from '@/libs/supabase/server';

import type { SendAppointmentInvitationResult } from './_shared';

export async function sendAppointmentInvitationAction(
  appointmentId: string,
  inviteeId: string,
): Promise<SendAppointmentInvitationResult> {
  if (!appointmentId || !inviteeId) {
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

  const { data: appointmentData, error: appointmentError } = await supabase
    .from('appointments')
    .select('appointment_id, group_id')
    .eq('appointment_id', appointmentId)
    .maybeSingle();

  if (appointmentError || !appointmentData) {
    return {
      ok: false,
      error: 'server-error',
      message: '약속 정보를 찾을 수 없습니다.',
    };
  }

  const { data: membership } = await supabase
    .from('appointment_members')
    .select('role')
    .eq('appointment_id', appointmentId)
    .eq('user_id', userData.user.id)
    .maybeSingle();

  if (!membership) {
    return {
      ok: false,
      error: 'forbidden',
      message: '약속 멤버만 초대할 수 있습니다.',
    };
  }

  const { data: existingMember } = await supabase
    .from('appointment_members')
    .select('user_id')
    .eq('appointment_id', appointmentId)
    .eq('user_id', inviteeId)
    .maybeSingle();

  if (existingMember) {
    return {
      ok: false,
      error: 'already-member',
      message: '이미 약속에 참여한 사용자입니다.',
    };
  }

  const { data: existingInvite } = await supabase
    .from('invitations')
    .select('invitation_id')
    .eq('appointment_id', appointmentId)
    .eq('invitee_id', inviteeId)
    .eq('type', 'appointment')
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
    group_id: appointmentData.group_id,
    appointment_id: appointmentId,
    inviter_id: userData.user.id,
    invitee_id: inviteeId,
    type: 'appointment',
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
