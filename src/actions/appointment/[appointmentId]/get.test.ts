import { requireUser } from '@/actions/_common/guards';

import { getAppointmentDetailAction } from './get';

jest.mock('@/actions/_common/guards', () => {
  const actual = jest.requireActual('@/actions/_common/guards');

  return {
    ...actual,
    requireUser: jest.fn(),
  };
});

describe('getAppointmentDetailAction', () => {
  const mockRequireUser = requireUser as jest.Mock;
  const userId = '20000000-0000-4000-8000-000000000001';
  const appointmentId = '20000000-0000-4000-8000-000000000101';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('약속 ID 형식이 올바르지 않으면 invalid-format을 반환한다', async () => {
    const result = await getAppointmentDetailAction('invalid-id');

    expect(result).toEqual({
      ok: false,
      error: 'invalid-format',
      message: '유효한 약속 ID가 아닙니다.',
    });
  });

  it('인증 실패는 그대로 반환한다', async () => {
    mockRequireUser.mockResolvedValue({
      ok: false,
      error: 'unauthorized',
      message: '로그인이 필요합니다.',
    });

    const result = await getAppointmentDetailAction(appointmentId);

    expect(result).toEqual({
      ok: false,
      error: 'unauthorized',
      message: '로그인이 필요합니다.',
    });
  });

  it('RPC 실패 시 server-error를 반환한다', async () => {
    const supabase = {
      rpc: jest.fn().mockResolvedValue({
        data: null,
        error: { message: 'rpc failed' },
      }),
    };

    mockRequireUser.mockResolvedValue({
      ok: true,
      supabase,
      user: { id: userId },
    });

    const result = await getAppointmentDetailAction(appointmentId);

    expect(result).toEqual({
      ok: false,
      error: 'server-error',
      message: '약속 정보를 불러올 수 없습니다.',
    });
  });

  it('상세 정보를 매핑해 반환한다', async () => {
    const row = {
      appointment_id: appointmentId,
      title: '점심 약속',
      status: 'confirmed',
      start_at: '2026-02-26T12:00:00.000Z',
      ends_at: '2026-02-26T13:00:00.000Z',
      created_at: '2026-02-25T09:00:00.000Z',
      creator_id: '20000000-0000-4000-8000-000000000999',
      creator_name: '홍길동',
      creator_nickname: '길동',
      creator_profile_image: null,
      place_id: '20000000-0000-4000-8000-000000000201',
      place_name: '카페',
      place_address: '서울시',
      place_category: '카페',
      place_latitude: 37.5,
      place_longitude: 127.0,
      member_count: 3,
      is_member: true,
      review_avg: 4.44,
      review_count: 12,
    };

    const supabase = {
      rpc: jest.fn().mockResolvedValue({
        data: [row],
        error: null,
      }),
    };

    mockRequireUser.mockResolvedValue({
      ok: true,
      supabase,
      user: { id: userId },
    });

    const result = await getAppointmentDetailAction(appointmentId);

    expect(supabase.rpc).toHaveBeenCalledWith('get_appointment_detail_with_count', {
      p_user_id: userId,
      p_appointment_id: appointmentId,
    });
    expect(result).toEqual({
      ok: true,
      data: {
        appointment: {
          appointmentId,
          title: '점심 약속',
          status: 'pending',
          startAt: '2026-02-26T12:00:00.000Z',
          endsAt: '2026-02-26T13:00:00.000Z',
          createdAt: '2026-02-25T09:00:00.000Z',
          creatorId: '20000000-0000-4000-8000-000000000999',
          creatorName: '홍길동',
          creatorNickname: '길동',
          creatorProfileImage: null,
          place: {
            placeId: '20000000-0000-4000-8000-000000000201',
            name: '카페',
            address: '서울시',
            category: '카페',
            latitude: 37.5,
            longitude: 127.0,
            reviewAverage: 4.4,
            reviewCount: 12,
          },
          memberCount: 3,
          isOwner: false,
          isMember: true,
        },
      },
    });
  });
});
