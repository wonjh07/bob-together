import { createSupabaseServerClient } from '@/libs/supabase/server';

import { getAppointmentMembersAction } from './get';

jest.mock('@/libs/supabase/server');

describe('getAppointmentMembersAction', () => {
  const rpc = jest.fn();
  const mockSupabaseClient = {
    auth: {
      getUser: jest.fn(),
    },
    rpc,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    (createSupabaseServerClient as jest.Mock).mockReturnValue(mockSupabaseClient);
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: {
        user: {
          id: '550e8400-e29b-41d4-a716-446655440123',
        },
      },
      error: null,
    });
    rpc.mockResolvedValue({
      data: [
        {
          ok: true,
          error_code: null,
          member_count: 1,
          members: [
            {
              user_id: '550e8400-e29b-41d4-a716-446655440123',
              role: 'owner',
              name: '홍길동',
              nickname: '길동',
              profile_image: null,
            },
          ],
        },
      ],
      error: null,
    });
  });

  it('약속 ID 형식이 올바르지 않으면 invalid-format을 반환한다', async () => {
    const result = await getAppointmentMembersAction('invalid-id');

    expect(result).toEqual({
      ok: false,
      error: 'invalid-format',
      message: '유효한 약속 ID가 아닙니다.',
    });
  });

  it('RPC 호출이 성공하면 멤버 목록을 반환한다', async () => {
    const appointmentId = '550e8400-e29b-41d4-a716-446655440000';
    const result = await getAppointmentMembersAction(appointmentId);

    expect(rpc).toHaveBeenCalledWith('get_appointment_members_with_count', {
      p_user_id: '550e8400-e29b-41d4-a716-446655440123',
      p_appointment_id: appointmentId,
    });
    expect(result).toEqual({
      ok: true,
      data: {
        memberCount: 1,
        members: [
          {
            userId: '550e8400-e29b-41d4-a716-446655440123',
            role: 'owner',
            name: '홍길동',
            nickname: '길동',
            profileImage: null,
          },
        ],
        currentUserId: '550e8400-e29b-41d4-a716-446655440123',
      },
    });
  });

  it('RPC가 forbidden을 반환하면 forbidden을 반환한다', async () => {
    rpc.mockResolvedValue({
      data: [
        {
          ok: false,
          error_code: 'forbidden',
          member_count: 0,
          members: [],
        },
      ],
      error: null,
    });

    const result = await getAppointmentMembersAction(
      '550e8400-e29b-41d4-a716-446655440000',
    );

    expect(result).toEqual({
      ok: false,
      error: 'forbidden',
      message: '약속을 찾을 수 없거나 접근 권한이 없습니다.',
    });
  });
});
