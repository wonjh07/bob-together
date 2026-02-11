'use server';

import { createSupabaseServerClient } from '@/libs/supabase/server';

import type {
  AppointmentListItem,
  ListAppointmentsParams,
  ListAppointmentsResult,
} from './_shared';

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

  if (startDateFilter) {
    query = query.gte('start_at', startDateFilter);
  }

  if (cursor) {
    query = query.lt('start_at', cursor);
  }

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

  const hasMore = filteredAppointments.length > limit;
  const resultAppointments = hasMore
    ? filteredAppointments.slice(0, limit)
    : filteredAppointments;

  const lastAppointment = resultAppointments[resultAppointments.length - 1];
  const nextCursor = hasMore && lastAppointment ? lastAppointment.start_at : null;

  const mappedAppointments: AppointmentListItem[] = resultAppointments.map((a) => {
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
  });

  return {
    ok: true,
    data: {
      appointments: mappedAppointments,
      nextCursor,
    },
  };
}
