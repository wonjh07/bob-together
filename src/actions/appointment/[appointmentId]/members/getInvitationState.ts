'use server';

import { z } from 'zod';

import { parseOrFail, requireUser } from '@/actions/_common/guards';
import { actionError, actionSuccess } from '@/actions/_common/result';

import type { GetAppointmentInvitationStateResult } from '@/actions/appointment/types';

const appointmentIdSchema = z.string().uuid('유효한 약속 ID가 아닙니다.');

export async function getAppointmentInvitationStateAction(
  appointmentId: string,
): Promise<GetAppointmentInvitationStateResult> {
  const parsed = parseOrFail(appointmentIdSchema, appointmentId);
  if (!parsed.ok) {
    return parsed;
  }

  const auth = await requireUser();
  if (!auth.ok) {
    return auth;
  }

  const { supabase } = auth;

  const { data: appointmentData, error: appointmentError } = await supabase
    .from('appointments')
    .select('appointment_id')
    .eq('appointment_id', parsed.data)
    .maybeSingle();

  if (appointmentError || !appointmentData) {
    return actionError('forbidden', '약속을 찾을 수 없거나 접근 권한이 없습니다.');
  }

  const [{ data: members, error: membersError }, { data: invites, error: invitesError }] =
    await Promise.all([
      supabase
        .from('appointment_members')
        .select('user_id')
        .eq('appointment_id', parsed.data),
      supabase
        .from('invitations')
        .select('invitee_id')
        .eq('appointment_id', parsed.data)
        .eq('type', 'appointment')
        .eq('status', 'pending'),
    ]);

  if (membersError || invitesError) {
    return actionError('server-error', '초대 상태를 불러올 수 없습니다.');
  }

  const memberIds = Array.from(new Set((members || []).map((row) => row.user_id)));
  const pendingInviteeIds = Array.from(
    new Set((invites || []).map((row) => row.invitee_id)),
  );

  return actionSuccess({
    memberIds,
    pendingInviteeIds,
  });
}

