import { requireUser } from '@/actions/_common/guards';

import { listAppointmentsAction } from './list';

jest.mock('@/actions/_common/guards', () => {
  const actual = jest.requireActual('@/actions/_common/guards');

  return {
    ...actual,
    requireUser: jest.fn(),
  };
});

describe('listAppointmentsAction', () => {
  const mockRequireUser = requireUser as jest.Mock;
  const userId = '20000000-0000-4000-8000-000000000001';
  const groupId = '20000000-0000-4000-8000-000000000101';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('groupId가 없으면 invalid-format을 반환한다', async () => {
    const result = await listAppointmentsAction({
      groupId: '',
    });

    expect(result).toEqual({
      ok: false,
      error: 'invalid-format',
      message: '그룹 ID가 필요합니다.',
    });
  });

  it('RPC 실패 시 server-error를 반환한다', async () => {
    const supabase = {
      rpc: jest.fn().mockResolvedValue({
        data: null,
        error: { message: 'rpc failed', code: 'XX000' },
      }),
    };
    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);

    mockRequireUser.mockResolvedValue({
      ok: true,
      supabase,
      user: { id: userId },
    });

    const result = await listAppointmentsAction({
      groupId,
      limit: 2,
    });

    expect(result).toEqual({
      ok: false,
      error: 'server-error',
      message: '약속 목록을 가져올 수 없습니다.',
    });
    consoleErrorSpy.mockRestore();
  });

  it('cursor 형식이 올바르지 않으면 invalid-format을 반환한다', async () => {
    const result = await listAppointmentsAction({
      groupId,
      cursor: {
        startAt: 'invalid-date',
        appointmentId: '20000000-0000-4000-8000-000000000299',
      },
    });

    expect(result).toEqual({
      ok: false,
      error: 'invalid-format',
      message: '유효한 커서 정보가 아닙니다.',
    });
  });

  it('키셋 커서를 계산해 목록을 반환한다', async () => {
    const supabase = {
      rpc: jest.fn().mockResolvedValue({
        data: [
          {
            appointment_id: '20000000-0000-4000-8000-000000000201',
            title: '약속 1',
            status: 'pending',
            start_at: '2026-02-25T10:00:00.000Z',
            ends_at: '2026-02-25T11:00:00.000Z',
            creator_id: userId,
            creator_name: '홍길동',
            creator_nickname: '길동',
            place_id: '20000000-0000-4000-8000-000000000301',
            place_name: '카페 1',
            place_address: '서울시',
            place_category: '카페',
            member_count: 3,
            comment_count: 2,
            is_owner: true,
            is_member: true,
          },
          {
            appointment_id: '20000000-0000-4000-8000-000000000202',
            title: '약속 2',
            status: 'canceled',
            start_at: '2026-02-24T10:00:00.000Z',
            ends_at: '2026-02-24T11:00:00.000Z',
            creator_id: '20000000-0000-4000-8000-000000000999',
            creator_name: '김철수',
            creator_nickname: null,
            place_id: '20000000-0000-4000-8000-000000000302',
            place_name: '식당 1',
            place_address: '부산시',
            place_category: null,
            member_count: 2,
            comment_count: 0,
            is_owner: false,
            is_member: true,
          },
          {
            appointment_id: '20000000-0000-4000-8000-000000000203',
            title: '약속 3',
            status: 'pending',
            start_at: '2026-02-23T10:00:00.000Z',
            ends_at: '2026-02-23T11:00:00.000Z',
            creator_id: userId,
            creator_name: null,
            creator_nickname: null,
            place_id: '20000000-0000-4000-8000-000000000303',
            place_name: '공원',
            place_address: '인천시',
            place_category: '야외',
            member_count: 1,
            comment_count: 1,
            is_owner: true,
            is_member: true,
          },
        ],
        error: null,
      }),
    };

    mockRequireUser.mockResolvedValue({
      ok: true,
      supabase,
      user: { id: userId },
    });

    const result = await listAppointmentsAction({
      groupId,
      period: 'all',
      type: 'all',
      limit: 2,
      cursor: {
        startAt: '2026-02-26T00:00:00.000Z',
        appointmentId: '20000000-0000-4000-8000-000000000299',
      },
    });

    expect(supabase.rpc).toHaveBeenCalledWith(
      'list_appointments_with_stats_cursor',
      {
        p_user_id: userId,
        p_group_id: groupId,
        p_period: 'all',
        p_type: 'all',
        p_cursor_start_at: '2026-02-26T00:00:00.000Z',
        p_cursor_appointment_id: '20000000-0000-4000-8000-000000000299',
        p_limit: 2,
      },
    );

    expect(result).toEqual({
      ok: true,
      data: {
        appointments: [
          {
            appointmentId: '20000000-0000-4000-8000-000000000201',
            title: '약속 1',
            status: 'pending',
            startAt: '2026-02-25T10:00:00.000Z',
            endsAt: '2026-02-25T11:00:00.000Z',
            creatorId: userId,
            creatorName: '홍길동',
            creatorNickname: '길동',
            place: {
              placeId: '20000000-0000-4000-8000-000000000301',
              name: '카페 1',
              address: '서울시',
              category: '카페',
            },
            memberCount: 3,
            commentCount: 2,
            isOwner: true,
            isMember: true,
          },
          {
            appointmentId: '20000000-0000-4000-8000-000000000202',
            title: '약속 2',
            status: 'canceled',
            startAt: '2026-02-24T10:00:00.000Z',
            endsAt: '2026-02-24T11:00:00.000Z',
            creatorId: '20000000-0000-4000-8000-000000000999',
            creatorName: '김철수',
            creatorNickname: null,
            place: {
              placeId: '20000000-0000-4000-8000-000000000302',
              name: '식당 1',
              address: '부산시',
              category: null,
            },
            memberCount: 2,
            commentCount: 0,
            isOwner: false,
            isMember: true,
          },
        ],
        nextCursor: {
          startAt: '2026-02-24T10:00:00.000Z',
          appointmentId: '20000000-0000-4000-8000-000000000202',
        },
      },
    });
  });
});
