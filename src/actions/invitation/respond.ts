'use server';

import { z } from 'zod';

import { parseOrFail, requireUser } from '@/actions/_common/guards';
import { actionError, actionSuccess } from '@/actions/_common/result';
import { isAppointmentEndedByTime } from '@/utils/appointmentStatus';

import type { RespondToInvitationResult } from './types';

const respondToInvitationSchema = z.object({
  invitationId: z.string().uuid('유효한 초대 ID가 아닙니다.'),
  decision: z.enum(['accepted', 'rejected']),
});

interface InvitationRow {
  invitation_id: string;
  type: 'group' | 'appointment';
  status: 'pending' | 'accepted' | 'rejected' | 'canceled';
  group_id: string;
  appointment_id: string | null;
}

interface AppointmentStatusRow {
  status: 'pending' | 'canceled';
  ends_at: string;
}

export async function respondToInvitationAction(input: {
  invitationId: string;
  decision: 'accepted' | 'rejected';
}): Promise<RespondToInvitationResult> {
  const parsed = parseOrFail(respondToInvitationSchema, input);
  if (!parsed.ok) {
    return parsed;
  }

  const auth = await requireUser();
  if (!auth.ok) {
    return auth;
  }

  const { supabase, user } = auth;
  const { invitationId, decision } = parsed.data;

  const { data: invitation, error: invitationError } = await supabase
    .from('invitations')
    .select('invitation_id, type, status, group_id, appointment_id')
    .eq('invitation_id', invitationId)
    .eq('invitee_id', user.id)
    .maybeSingle<InvitationRow>();

  if (invitationError || !invitation) {
    return actionError('invitation-not-found', '초대 정보를 찾을 수 없습니다.');
  }

  if (invitation.status !== 'pending') {
    return actionError(
      'invitation-already-responded',
      '이미 처리된 초대입니다.',
    );
  }

  if (decision === 'accepted') {
    if (invitation.type === 'group') {
      const { data: existingGroupMember } = await supabase
        .from('group_members')
        .select('user_id')
        .eq('group_id', invitation.group_id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (!existingGroupMember) {
        const { error: joinGroupError } = await supabase
          .from('group_members')
          .insert({
            group_id: invitation.group_id,
            user_id: user.id,
            role: 'member',
          });

        if (joinGroupError && joinGroupError.code !== '23505') {
          return actionError('server-error', '그룹 참여 처리 중 오류가 발생했습니다.');
        }
      }
    }

    if (invitation.type === 'appointment') {
      if (!invitation.appointment_id) {
        return actionError('invalid-invitation', '유효하지 않은 약속 초대입니다.');
      }

      const { data: groupMembership, error: groupMembershipError } =
        await supabase
          .from('group_members')
          .select('user_id')
          .eq('group_id', invitation.group_id)
          .eq('user_id', user.id)
          .maybeSingle();

      if (groupMembershipError) {
        return actionError('server-error', '초대 수락 권한 확인 중 오류가 발생했습니다.');
      }

      if (!groupMembership) {
        return actionError(
          'forbidden',
          '그룹 멤버가 아니라 약속 초대를 수락할 수 없습니다. 그룹 초대를 먼저 수락해주세요.',
        );
      }

      const { data: appointment, error: appointmentError } = await supabase
        .from('appointments')
        .select('status, ends_at')
        .eq('appointment_id', invitation.appointment_id)
        .maybeSingle<AppointmentStatusRow>();

      if (appointmentError || !appointment) {
        return actionError('invitation-not-found', '약속 정보를 찾을 수 없습니다.');
      }

      if (appointment.status === 'canceled') {
        return actionError('forbidden', '취소된 약속은 수락할 수 없습니다.');
      }

      if (isAppointmentEndedByTime(appointment.ends_at)) {
        return actionError('forbidden', '종료된 약속은 수락할 수 없습니다.');
      }

      const { data: existingAppointmentMember } = await supabase
        .from('appointment_members')
        .select('user_id')
        .eq('appointment_id', invitation.appointment_id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (!existingAppointmentMember) {
        const { error: joinAppointmentError } = await supabase
          .from('appointment_members')
          .insert({
            appointment_id: invitation.appointment_id,
            user_id: user.id,
            role: 'member',
          });

        if (joinAppointmentError && joinAppointmentError.code !== '23505') {
          if (joinAppointmentError.code === '42501') {
            return actionError(
              'forbidden',
              '약속에 참여할 권한이 없습니다. 그룹 가입 상태를 확인해주세요.',
            );
          }

          return actionError(
            'server-error',
            '약속 참여 처리 중 오류가 발생했습니다.',
          );
        }
      }
    }
  }

  const { data: updated, error: updateError } = await supabase
    .from('invitations')
    .update({
      status: decision,
      responded_time: new Date().toISOString(),
    })
    .eq('invitation_id', invitationId)
    .eq('invitee_id', user.id)
    .eq('status', 'pending')
    .select('invitation_id')
    .maybeSingle();

  if (updateError) {
    return actionError('server-error', '초대 상태를 변경하지 못했습니다.');
  }

  if (!updated) {
    return actionError(
      'invitation-already-responded',
      '이미 처리된 초대입니다.',
    );
  }

  return actionSuccess({
    invitationId: invitation.invitation_id,
    status: decision,
    type: invitation.type,
    groupId: invitation.group_id,
    appointmentId: invitation.appointment_id,
  });
}
