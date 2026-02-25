'use server';

import { z } from 'zod';

import { parseOrFail, requireUser } from '@/actions/_common/guards';
import { actionError, actionSuccess } from '@/actions/_common/result';
import { isAppointmentEndedByTime } from '@/utils/appointmentStatus';

import type { SendAppointmentInvitationResult } from '@/actions/appointment/types';

const sendAppointmentInvitationSchema = z.object({
  appointmentId: z.string().uuid('유효한 약속 ID가 아닙니다.'),
  inviteeId: z.string().uuid('유효한 사용자 ID가 아닙니다.'),
});

interface AppointmentInvitationRow {
  appointment_id: string;
  group_id: string;
  status: 'pending' | 'confirmed' | 'canceled';
  ends_at: string;
}

export async function sendAppointmentInvitationAction(
  appointmentId: string,
  inviteeId: string,
): Promise<SendAppointmentInvitationResult> {
  const parsed = parseOrFail(sendAppointmentInvitationSchema, {
    appointmentId,
    inviteeId,
  });
  if (!parsed.ok) {
    return parsed;
  }

  const auth = await requireUser();
  if (!auth.ok) {
    return auth;
  }
  const { supabase, user } = auth;
  const { appointmentId: parsedAppointmentId, inviteeId: parsedInviteeId } =
    parsed.data;

  if (user.id === parsedInviteeId) {
    return actionError('invalid-format', '본인은 초대할 수 없습니다.');
  }

  const { data: appointmentData, error: appointmentError } = await supabase
    .from('appointments')
    .select('appointment_id, group_id, status, ends_at')
    .eq('appointment_id', parsedAppointmentId)
    .maybeSingle<AppointmentInvitationRow>();

  if (appointmentError || !appointmentData) {
    return actionError('server-error', '약속 정보를 찾을 수 없습니다.');
  }

  if (appointmentData.status === 'canceled') {
    return actionError('forbidden', '취소된 약속은 초대할 수 없습니다.');
  }

  if (isAppointmentEndedByTime(appointmentData.ends_at)) {
    return actionError('forbidden', '종료된 약속은 초대할 수 없습니다.');
  }

  const { data: membership } = await supabase
    .from('appointment_members')
    .select('role')
    .eq('appointment_id', parsedAppointmentId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (!membership) {
    return actionError('forbidden', '약속 멤버만 초대할 수 있습니다.');
  }

  const { data: existingMember } = await supabase
    .from('appointment_members')
    .select('user_id')
    .eq('appointment_id', parsedAppointmentId)
    .eq('user_id', parsedInviteeId)
    .maybeSingle();

  if (existingMember) {
    return actionError('already-member', '이미 약속에 참여한 사용자입니다.');
  }

  const { data: inviteeGroupMembership, error: inviteeGroupMembershipError } =
    await supabase
      .from('group_members')
      .select('user_id')
      .eq('group_id', appointmentData.group_id)
      .eq('user_id', parsedInviteeId)
      .maybeSingle();

  if (inviteeGroupMembershipError) {
    return actionError('server-error', '초대 대상 검증 중 오류가 발생했습니다.');
  }

  if (!inviteeGroupMembership) {
    return actionError(
      'forbidden',
      '해당 사용자는 그룹 멤버가 아니어서 약속 초대를 보낼 수 없습니다.',
    );
  }

  const { data: existingInvite, error: existingInviteError } = await supabase
    .from('invitations')
    .select('invitation_id')
    .eq('appointment_id', parsedAppointmentId)
    .eq('invitee_id', parsedInviteeId)
    .eq('type', 'appointment')
    .eq('status', 'pending')
    .maybeSingle();

  if (existingInviteError) {
    console.error(
      '[sendAppointmentInvitationAction] existing invite check failed',
      {
        message: existingInviteError.message,
        code: existingInviteError.code,
        details: existingInviteError.details,
        hint: existingInviteError.hint,
        appointmentId: parsedAppointmentId,
        inviteeId: parsedInviteeId,
      },
    );
  }

  if (existingInvite) {
    return actionError('invite-already-sent', '이미 초대가 발송되었습니다.');
  }

  const { error: inviteError } = await supabase.from('invitations').insert({
    group_id: appointmentData.group_id,
    appointment_id: parsedAppointmentId,
    inviter_id: user.id,
    invitee_id: parsedInviteeId,
    type: 'appointment',
    status: 'pending',
  });

  if (inviteError) {
    console.error('[sendAppointmentInvitationAction] invite insert failed', {
      message: inviteError.message,
      code: inviteError.code,
      details: inviteError.details,
      hint: inviteError.hint,
      appointmentId: parsedAppointmentId,
      inviteeId: parsedInviteeId,
      inviterId: user.id,
    });

    if (inviteError.code === '23505') {
      return actionError('invite-already-sent', '이미 초대가 발송되었습니다.');
    }

    if (inviteError.code === '42501') {
      return actionError('forbidden', '초대 권한이 없습니다.');
    }

    return actionError('server-error', '초대 전송 중 오류가 발생했습니다.');
  }

  return actionSuccess();
}
