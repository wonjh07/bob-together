import { requireUser } from '@/actions/_common/guards';

import { listAppointmentHistoryAction } from './list';

jest.mock('@/actions/_common/guards', () => {
  const actual = jest.requireActual('@/actions/_common/guards');

  return {
    ...actual,
    requireUser: jest.fn(),
  };
});

const USER_ID = '20000000-0000-4000-8000-000000000002';

describe('listAppointmentHistoryAction', () => {
  const mockRequireUser = requireUser as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('인증 실패는 그대로 반환한다', async () => {
    mockRequireUser.mockResolvedValue({
      ok: false,
      error: 'unauthorized',
      message: '로그인이 필요합니다.',
    });

    const result = await listAppointmentHistoryAction();

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
      user: { id: USER_ID },
    });

    const result = await listAppointmentHistoryAction();

    expect(result).toEqual({
      ok: false,
      error: 'server-error',
      message: '히스토리 약속 목록을 불러오지 못했습니다.',
    });
  });

  it('히스토리 결과를 매핑하고 nextCursor를 계산한다', async () => {
    const rows = [
      {
        appointment_id: 'a-3',
        title: '약속 3',
        start_at: '2026-02-01T09:00:00.000Z',
        ends_at: '2026-02-01T10:00:00.000Z',
        creator_id: USER_ID,
        creator_name: '홍길동',
        creator_nickname: '길동',
        creator_profile_image: null,
        place_id: 'p-1',
        place_name: '카페',
        place_address: '서울시',
        place_category: '카페',
        member_count: '3',
        review_avg: '4.5',
        review_count: '12',
        can_write_review: false,
      },
      {
        appointment_id: 'a-2',
        title: '약속 2',
        start_at: '2026-01-31T09:00:00.000Z',
        ends_at: '2026-01-31T10:00:00.000Z',
        creator_id: '20000000-0000-4000-8000-000000000999',
        creator_name: '김철수',
        creator_nickname: null,
        creator_profile_image: 'https://example.com/profile.png',
        place_id: 'p-2',
        place_name: null,
        place_address: null,
        place_category: null,
        member_count: 2,
        review_avg: null,
        review_count: null,
        can_write_review: true,
      },
      {
        appointment_id: 'a-1',
        title: '약속 1',
        start_at: '2026-01-30T09:00:00.000Z',
        ends_at: '2026-01-30T10:00:00.000Z',
        creator_id: USER_ID,
        creator_name: null,
        creator_nickname: null,
        creator_profile_image: null,
        place_id: 'p-3',
        place_name: '식당',
        place_address: '부산시',
        place_category: '한식',
        member_count: 1,
        review_avg: '3.2',
        review_count: '5',
        can_write_review: true,
      },
    ];

    const supabase = {
      rpc: jest.fn().mockResolvedValue({
        data: rows,
        error: null,
      }),
    };

    mockRequireUser.mockResolvedValue({
      ok: true,
      supabase,
      user: { id: USER_ID },
    });

    const result = await listAppointmentHistoryAction({
      limit: 2,
      cursor: {
        endsAt: '2026-02-02T10:00:00.000Z',
        appointmentId: '20000000-0000-4000-8000-000000000199',
      },
    });

    expect(supabase.rpc).toHaveBeenCalledWith(
      'list_appointment_history_with_stats_cursor',
      {
        p_user_id: USER_ID,
        p_limit: 2,
        p_cursor_ends_at: '2026-02-02T10:00:00.000Z',
        p_cursor_appointment_id: '20000000-0000-4000-8000-000000000199',
      },
    );

    expect(result).toEqual({
      ok: true,
      data: {
        appointments: [
          {
            appointmentId: 'a-3',
            title: '약속 3',
            startAt: '2026-02-01T09:00:00.000Z',
            endsAt: '2026-02-01T10:00:00.000Z',
            creatorId: USER_ID,
            creatorName: '홍길동',
            creatorNickname: '길동',
            creatorProfileImage: null,
            place: {
              placeId: 'p-1',
              name: '카페',
              address: '서울시',
              category: '카페',
              reviewAverage: 4.5,
              reviewCount: 12,
            },
            memberCount: 3,
            isOwner: true,
            canWriteReview: false,
          },
          {
            appointmentId: 'a-2',
            title: '약속 2',
            startAt: '2026-01-31T09:00:00.000Z',
            endsAt: '2026-01-31T10:00:00.000Z',
            creatorId: '20000000-0000-4000-8000-000000000999',
            creatorName: '김철수',
            creatorNickname: null,
            creatorProfileImage: 'https://example.com/profile.png',
            place: {
              placeId: 'p-2',
              name: '장소 미정',
              address: '',
              category: null,
              reviewAverage: null,
              reviewCount: 0,
            },
            memberCount: 2,
            isOwner: false,
            canWriteReview: true,
          },
        ],
        nextCursor: {
          endsAt: '2026-01-31T10:00:00.000Z',
          appointmentId: 'a-2',
        },
      },
    });
  });

  it('결과가 비어 있으면 빈 목록을 반환한다', async () => {
    const supabase = {
      rpc: jest.fn().mockResolvedValue({
        data: [],
        error: null,
      }),
    };

    mockRequireUser.mockResolvedValue({
      ok: true,
      supabase,
      user: { id: USER_ID },
    });

    const result = await listAppointmentHistoryAction({ limit: 5 });

    expect(result).toEqual({
      ok: true,
      data: {
        appointments: [],
        nextCursor: null,
      },
    });
  });
});
