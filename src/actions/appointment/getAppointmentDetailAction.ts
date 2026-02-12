'use server';

import { z } from 'zod';

import { createSupabaseServerClient } from '@/libs/supabase/server';

import type { AppointmentDetailItem, GetAppointmentDetailResult } from './_shared';

const appointmentIdSchema = z.string().uuid('유효한 약속 ID가 아닙니다.');

interface AppointmentDetailRow {
  appointment_id: string;
  title: string;
  status: 'pending' | 'confirmed' | 'canceled';
  start_at: string;
  ends_at: string;
  created_at: string;
  creator_id: string;
  creator_name: string | null;
  creator_nickname: string | null;
  creator_profile_image: string | null;
  place_id: string;
  place_name: string;
  place_address: string;
  place_category: string | null;
  place_latitude: number;
  place_longitude: number;
  member_count: number;
  is_member: boolean;
  review_avg: number | null;
  review_count: number;
}

export async function getAppointmentDetailAction(
  appointmentId: string,
): Promise<GetAppointmentDetailResult> {
  const parsed = appointmentIdSchema.safeParse(appointmentId);
  if (!parsed.success) {
    return {
      ok: false,
      error: 'invalid-format',
      message: parsed.error.issues[0]?.message || '유효한 약속 ID가 아닙니다.',
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

  const { data, error } = await supabase.rpc('get_appointment_detail_with_count', {
    p_user_id: userData.user.id,
    p_appointment_id: parsed.data,
  });

  if (error) {
    return {
      ok: false,
      error: 'server-error',
      message: '약속 정보를 불러올 수 없습니다.',
    };
  }

  const row = ((data as AppointmentDetailRow[] | null) ?? [])[0];
  if (!row) {
    return {
      ok: false,
      error: 'forbidden',
      message: '약속을 찾을 수 없거나 접근 권한이 없습니다.',
    };
  }

  const appointment: AppointmentDetailItem = {
    appointmentId: row.appointment_id,
    title: row.title,
    status: row.status,
    startAt: row.start_at,
    endsAt: row.ends_at,
    createdAt: row.created_at,
    creatorId: row.creator_id,
    creatorName: row.creator_name,
    creatorNickname: row.creator_nickname,
    creatorProfileImage: row.creator_profile_image,
    place: {
      placeId: row.place_id,
      name: row.place_name,
      address: row.place_address,
      category: row.place_category,
      latitude: row.place_latitude,
      longitude: row.place_longitude,
      reviewAverage:
        typeof row.review_avg === 'number'
          ? Number(row.review_avg.toFixed(1))
          : null,
      reviewCount: Number(row.review_count) || 0,
    },
    memberCount: Number(row.member_count) || 0,
    isOwner: row.creator_id === userData.user.id,
    isMember: row.is_member,
  };

  return {
    ok: true,
    data: { appointment },
  };
}
