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

type AppointmentQueryResult = {
  appointment_id: string;
  group_id: string;
  status: 'pending' | 'confirmed' | 'canceled';
  ends_at: string;
} | null;

function createAwaitableQuery<T>(result: { data: T; error: null }) {
  const query = {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    or: jest.fn().mockReturnThis(),
    neq: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    maybeSingle: jest.fn().mockResolvedValue(result),
    then: (
      onFulfilled: (value: { data: T; error: null }) => unknown,
      onRejected?: (reason: unknown) => unknown,
    ) => Promise.resolve(result).then(onFulfilled, onRejected),
  };

  return query;
}

function createAppointmentSupabaseMock(result: AppointmentQueryResult) {
  const appointmentsQuery = {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    maybeSingle: jest.fn().mockResolvedValue({
      data: result,
      error: null,
    }),
  };

  const supabase = {
    from: jest.fn((table: string) => {
      if (table === 'appointments') {
        return appointmentsQuery;
      }

      throw new Error(`unexpected table access: ${table}`);
    }),
  };

  return { supabase };
}

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
    const { supabase } = createAppointmentSupabaseMock({
      appointment_id: APPOINTMENT_ID,
      group_id: '20000000-0000-4000-8000-000000000009',
      status: 'canceled',
      ends_at: new Date(Date.now() + 60_000).toISOString(),
    });

    mockRequireUser.mockResolvedValue({
      ok: true,
      supabase,
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
    const { supabase } = createAppointmentSupabaseMock({
      appointment_id: APPOINTMENT_ID,
      group_id: '20000000-0000-4000-8000-000000000009',
      status: 'pending',
      ends_at: new Date(Date.now() - 60_000).toISOString(),
    });

    mockRequireUser.mockResolvedValue({
      ok: true,
      supabase,
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

  it('pending 초대 대상도 검색 결과에 포함하고 기존 멤버는 제외한다', async () => {
    const appointmentQuery = createAwaitableQuery({
      data: {
        appointment_id: APPOINTMENT_ID,
        group_id: '20000000-0000-4000-8000-000000000009',
        status: 'pending',
        ends_at: new Date(Date.now() + 60_000).toISOString(),
      },
      error: null,
    });

    const inviterMembershipQuery = createAwaitableQuery({
      data: { user_id: USER_ID },
      error: null,
    });

    const candidatesQuery = createAwaitableQuery({
      data: [
        {
          user_id: '20000000-0000-4000-8000-000000000003',
          name: '기존 멤버',
          nickname: 'member',
          group_members: [{ group_id: '20000000-0000-4000-8000-000000000009' }],
        },
        {
          user_id: '20000000-0000-4000-8000-000000000004',
          name: '대기 멤버',
          nickname: 'pending',
          group_members: [{ group_id: '20000000-0000-4000-8000-000000000009' }],
        },
        {
          user_id: '20000000-0000-4000-8000-000000000005',
          name: '초대 가능',
          nickname: 'available',
          group_members: [{ group_id: '20000000-0000-4000-8000-000000000009' }],
        },
      ],
      error: null,
    });

    const appointmentMembersQuery = createAwaitableQuery({
      data: [{ user_id: '20000000-0000-4000-8000-000000000003' }],
      error: null,
    });

    let appointmentMembersCallCount = 0;

    const supabase = {
      from: jest.fn((table: string) => {
        if (table === 'appointments') {
          return appointmentQuery;
        }

        if (table === 'appointment_members') {
          appointmentMembersCallCount += 1;
          return appointmentMembersCallCount === 1
            ? inviterMembershipQuery
            : appointmentMembersQuery;
        }

        if (table === 'users') {
          return candidatesQuery;
        }

        throw new Error(`unexpected table access: ${table}`);
      }),
    };

    mockRequireUser.mockResolvedValue({
      ok: true,
      supabase,
      user: { id: USER_ID },
    });

    const result = await searchAppointmentInvitableUsersAction({
      appointmentId: APPOINTMENT_ID,
      query: '테스트',
    });

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
