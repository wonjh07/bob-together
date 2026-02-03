'use server';

import { createSupabaseServerClient } from '@/libs/supabase/server';
import { appointmentCreateSchema } from '@/schemas/appointment';

import type { AppointmentCreateInput } from '@/schemas/appointment';
import type { ActionResult, AppointmentErrorCode } from '@/types/result';

export type PeriodFilter = 'today' | 'week' | 'month' | 'all';
export type TypeFilter = 'all' | 'created' | 'joined';

export interface AppointmentListItem {
  appointmentId: string;
  title: string;
  status: 'pending' | 'confirmed' | 'canceled';
  startAt: string;
  endsAt: string;
  creatorId: string;
  creatorName: string | null;
  creatorNickname: string | null;
  place: {
    placeId: string;
    name: string;
    address: string;
    category: string | null;
  };
  memberCount: number;
  isOwner: boolean;
  isMember: boolean;
}

export interface ListAppointmentsParams {
  groupId: string;
  period?: PeriodFilter;
  type?: TypeFilter;
  cursor?: string;
  limit?: number;
}

export type ListAppointmentsResult = ActionResult<
  {
    appointments: AppointmentListItem[];
    nextCursor: string | null;
  },
  AppointmentErrorCode
>;

export type CreateAppointmentResult = ActionResult<
  { appointmentId: string },
  AppointmentErrorCode
>;

export type SendAppointmentInvitationResult = ActionResult<
  void,
  AppointmentErrorCode
>;

export async function createAppointmentAction(
  params: AppointmentCreateInput,
): Promise<CreateAppointmentResult> {
  const parsed = appointmentCreateSchema.safeParse(params);

  if (!parsed.success) {
    const firstError = parsed.error.issues[0];
    return {
      ok: false,
      error: 'invalid-format',
      message: firstError?.message || '입력값이 올바르지 않습니다.',
    };
  }

  const { title, date, startTime, endTime, place, groupId } = parsed.data;

  const startAt = new Date(`${date}T${startTime}:00`);
  const endsAt = new Date(`${date}T${endTime}:00`);

  if (Number.isNaN(startAt.getTime()) || Number.isNaN(endsAt.getTime())) {
    return {
      ok: false,
      error: 'invalid-format',
      message: '약속 날짜/시간을 확인해주세요.',
    };
  }

  if (endsAt <= startAt) {
    return {
      ok: false,
      error: 'invalid-time',
      message: '종료 시간이 시작 시간보다 늦어야 합니다.',
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

  let resolvedGroupId = groupId;

  if (!resolvedGroupId) {
    const { data: groupData, error: groupError } = await supabase
      .from('group_members')
      .select('group_id')
      .eq('user_id', userData.user.id)
      .order('joined_at', { ascending: false })
      .maybeSingle();

    if (groupError || !groupData) {
      return {
        ok: false,
        error: 'missing-group',
        message: '가입한 그룹이 없습니다.',
      };
    }

    resolvedGroupId = groupData.group_id;
  }

  const { data: placeData, error: placeError } = await supabase
    .from('places')
    .upsert(
      {
        kakao_id: place.kakaoId,
        name: place.name,
        address: place.address,
        category: place.category || '',
        latitude: place.latitude,
        longitude: place.longitude,
      },
      { onConflict: 'kakao_id' },
    )
    .select('place_id')
    .single();

  if (placeError || !placeData) {
    console.error('[createAppointmentAction] place upsert failed', {
      message: placeError?.message,
      code: placeError?.code,
      details: placeError?.details,
      hint: placeError?.hint,
      kakaoId: place.kakaoId,
      groupId: resolvedGroupId,
    });
    return {
      ok: false,
      error: 'missing-place',
      message: '장소 정보를 저장할 수 없습니다.',
    };
  }

  const { data: appointmentData, error: appointmentError } = await supabase
    .from('appointments')
    .insert({
      title,
      creator_id: userData.user.id,
      group_id: resolvedGroupId,
      start_at: startAt.toISOString(),
      ends_at: endsAt.toISOString(),
      place_id: placeData.place_id,
      status: 'pending',
    })
    .select('appointment_id')
    .single();

  if (appointmentError || !appointmentData) {
    console.error('[createAppointmentAction] appointment insert failed', {
      message: appointmentError?.message,
      code: appointmentError?.code,
      details: appointmentError?.details,
      hint: appointmentError?.hint,
      groupId: resolvedGroupId,
      placeId: placeData?.place_id,
    });
    return {
      ok: false,
      error: 'server-error',
      message: '약속 생성 중 오류가 발생했습니다.',
    };
  }

  const { error: memberError } = await supabase
    .from('appointment_members')
    .insert({
      appointment_id: appointmentData.appointment_id,
      user_id: userData.user.id,
      role: 'owner',
    });

  if (memberError) {
    console.error('[createAppointmentAction] appointment member insert failed', {
      message: memberError?.message,
      code: memberError?.code,
      details: memberError?.details,
      hint: memberError?.hint,
      appointmentId: appointmentData.appointment_id,
    });
    return {
      ok: false,
      error: 'server-error',
      message: '약속 멤버 등록 중 오류가 발생했습니다.',
    };
  }

  return {
    ok: true,
    data: { appointmentId: appointmentData.appointment_id },
  };
}

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

export async function listAppointmentsAction(
  params: ListAppointmentsParams,
): Promise<ListAppointmentsResult> {
  const { groupId, period = 'all', type = 'all', cursor, limit = 10 } = params;

  if (!groupId) {
    return {
      ok: false,
      error: 'invalid-format',
      message: '그룹 ID가 필요합니다.',
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

  const userId = userData.user.id;

  // Check if user is member of the group
  const { data: membership } = await supabase
    .from('group_members')
    .select('user_id')
    .eq('group_id', groupId)
    .eq('user_id', userId)
    .maybeSingle();

  if (!membership) {
    return {
      ok: false,
      error: 'forbidden',
      message: '그룹 멤버만 약속 목록을 볼 수 있습니다.',
    };
  }

  // Build date filter
  let startDateFilter: string | null = null;
  const now = new Date();

  switch (period) {
    case 'today': {
      const todayStart = new Date(now);
      todayStart.setHours(0, 0, 0, 0);
      startDateFilter = todayStart.toISOString();
      break;
    }
    case 'week': {
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);
      startDateFilter = weekAgo.toISOString();
      break;
    }
    case 'month': {
      const monthAgo = new Date(now);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      startDateFilter = monthAgo.toISOString();
      break;
    }
    case 'all':
    default:
      startDateFilter = null;
  }

  // Build query
  let query = supabase
    .from('appointments')
    .select(
      `
      appointment_id,
      title,
      status,
      start_at,
      ends_at,
      creator_id,
      creator:users!appointments_creator_id_fkey (
        name,
        nickname
      ),
      place:places!appointments_place_id_fkey (
        place_id,
        name,
        address,
        category
      ),
      appointment_members (
        user_id,
        role
      )
    `,
    )
    .eq('group_id', groupId)
    .order('start_at', { ascending: false });

  // Apply period filter
  if (startDateFilter) {
    query = query.gte('start_at', startDateFilter);
  }

  // Apply cursor for pagination
  if (cursor) {
    query = query.lt('start_at', cursor);
  }

  // Fetch one extra to determine if there's more
  query = query.limit(limit + 1);

  const { data: appointments, error: appointmentsError } = await query;

  if (appointmentsError) {
    console.error('[listAppointmentsAction] query failed', {
      message: appointmentsError.message,
      code: appointmentsError.code,
    });
    return {
      ok: false,
      error: 'server-error',
      message: '약속 목록을 가져올 수 없습니다.',
    };
  }

  if (!appointments) {
    return {
      ok: true,
      data: { appointments: [], nextCursor: null },
    };
  }

  // Filter by type
  let filteredAppointments = appointments;
  if (type === 'created') {
    filteredAppointments = appointments.filter((a) => a.creator_id === userId);
  } else if (type === 'joined') {
    filteredAppointments = appointments.filter(
      (a) =>
        a.creator_id !== userId &&
        a.appointment_members?.some((m) => m.user_id === userId),
    );
  }

  // Determine if there's more data
  const hasMore = filteredAppointments.length > limit;
  const resultAppointments = hasMore
    ? filteredAppointments.slice(0, limit)
    : filteredAppointments;

  // Get next cursor
  const lastAppointment = resultAppointments[resultAppointments.length - 1];
  const nextCursor = hasMore && lastAppointment ? lastAppointment.start_at : null;

  // Map to response type
  const mappedAppointments: AppointmentListItem[] = resultAppointments.map(
    (a) => {
      const members = a.appointment_members || [];
      const isOwner = a.creator_id === userId;
      const isMember = members.some((m) => m.user_id === userId);
      const creator = a.creator as { name: string | null; nickname: string | null } | null;
      const place = a.place as {
        place_id: string;
        name: string;
        address: string;
        category: string | null;
      } | null;

      return {
        appointmentId: a.appointment_id,
        title: a.title,
        status: a.status as 'pending' | 'confirmed' | 'canceled',
        startAt: a.start_at,
        endsAt: a.ends_at,
        creatorId: a.creator_id,
        creatorName: creator?.name ?? null,
        creatorNickname: creator?.nickname ?? null,
        place: place
          ? {
              placeId: place.place_id,
              name: place.name,
              address: place.address,
              category: place.category,
            }
          : {
              placeId: '',
              name: '장소 미정',
              address: '',
              category: null,
            },
        memberCount: members.length,
        isOwner,
        isMember,
      };
    },
  );

  return {
    ok: true,
    data: {
      appointments: mappedAppointments,
      nextCursor,
    },
  };
}
