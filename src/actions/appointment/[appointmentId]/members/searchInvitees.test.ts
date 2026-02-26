import { requireUser } from '@/actions/_common/guards';

import { searchAppointmentInvitableUsersAction } from './searchInvitees';

jest.mock('@/actions/_common/guards', () => {
  const actual = jest.requireActual('@/actions/_common/guards');

  return {
    ...actual,
    requireUser: jest.fn(),
  };
});

const APPOINTMENT_ID = '20000000-0000-4000-8000-000000000001';
const USER_ID = '20000000-0000-4000-8000-000000000002';

describe('searchAppointmentInvitableUsersAction', () => {
  const mockRequireUser = requireUser as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('약속 ID 형식이 올바르지 않으면 invalid-format을 반환한다', async () => {
    const result = await searchAppointmentInvitableUsersAction({
      appointmentId: 'invalid-id',
      query: '테스트',
    });

    expect(result).toEqual({
      ok: false,
      error: 'invalid-format',
      message: '유효한 약속 ID가 아닙니다.',
    });
  });

  it('취소된 약속은 검색을 차단한다', async () => {
    const rpc = jest.fn().mockResolvedValue({
      data: [
        {
          ok: false,
          error_code: 'forbidden-appointment-canceled',
          users: [],
        },
      ],
      error: null,
    });

    mockRequireUser.mockResolvedValue({
      ok: true,
      supabase: { rpc },
      user: { id: USER_ID },
    });

    const result = await searchAppointmentInvitableUsersAction({
      appointmentId: APPOINTMENT_ID,
      query: '테스트',
    });

    expect(result).toEqual({
      ok: false,
      error: 'forbidden',
      message: '취소된 약속은 초대할 수 없습니다.',
    });
  });

  it('종료된 약속은 검색을 차단한다', async () => {
    const rpc = jest.fn().mockResolvedValue({
      data: [
        {
          ok: false,
          error_code: 'forbidden-appointment-ended',
          users: [],
        },
      ],
      error: null,
    });

    mockRequireUser.mockResolvedValue({
      ok: true,
      supabase: { rpc },
      user: { id: USER_ID },
    });

    const result = await searchAppointmentInvitableUsersAction({
      appointmentId: APPOINTMENT_ID,
      query: '테스트',
    });

    expect(result).toEqual({
      ok: false,
      error: 'forbidden',
      message: '종료된 약속은 초대할 수 없습니다.',
    });
  });

  it('기존 멤버를 제외한 초대 대상을 반환한다', async () => {
    const rpc = jest.fn().mockResolvedValue({
      data: [
        {
          ok: true,
          error_code: null,
          users: [
            {
              user_id: '20000000-0000-4000-8000-000000000004',
              name: '대기 멤버',
              nickname: 'pending',
            },
            {
              user_id: '20000000-0000-4000-8000-000000000005',
              name: '초대 가능',
              nickname: 'available',
            },
          ],
        },
      ],
      error: null,
    });

    mockRequireUser.mockResolvedValue({
      ok: true,
      supabase: { rpc },
      user: { id: USER_ID },
    });

    const result = await searchAppointmentInvitableUsersAction({
      appointmentId: APPOINTMENT_ID,
      query: '테스트',
    });

    expect(rpc).toHaveBeenCalledWith(
      'search_appointment_invitable_users_transactional',
      expect.objectContaining({
        p_inviter_id: USER_ID,
        p_appointment_id: APPOINTMENT_ID,
        p_query: '테스트',
        p_limit: 6,
        p_candidate_limit: 20,
      }),
    );

    expect(result).toEqual({
      ok: true,
      data: {
        users: [
          {
            userId: '20000000-0000-4000-8000-000000000004',
            name: '대기 멤버',
            nickname: 'pending',
          },
          {
            userId: '20000000-0000-4000-8000-000000000005',
            name: '초대 가능',
            nickname: 'available',
          },
        ],
      },
    });
  });
});
