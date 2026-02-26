import { requireUser } from '@/actions/_common/guards';

import { listReviewableAppointmentsAction } from './list';

jest.mock('@/actions/_common/guards', () => {
  const actual = jest.requireActual('@/actions/_common/guards');

  return {
    ...actual,
    requireUser: jest.fn(),
  };
});

describe('listReviewableAppointmentsAction', () => {
  const mockRequireUser = requireUser as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('cursor 형식이 올바르지 않으면 invalid-format을 반환한다', async () => {
    const result = await listReviewableAppointmentsAction({
      cursor: {
        endsAt: 'invalid-date',
        appointmentId: '20000000-0000-4000-8000-000000000101',
      },
    });

    expect(result).toEqual({
      ok: false,
      error: 'invalid-format',
      message: '유효한 커서 정보가 아닙니다.',
    });
  });

  it('RPC가 실패하면 server-error를 반환한다', async () => {
    const supabase = {
      rpc: jest.fn().mockResolvedValue({
        data: null,
        error: { message: 'rpc failed' },
      }),
    };

    mockRequireUser.mockResolvedValue({
      ok: true,
      supabase,
      user: { id: '20000000-0000-4000-8000-000000000001' },
    });

    const result = await listReviewableAppointmentsAction({ limit: 2 });

    expect(result).toEqual({
      ok: false,
      error: 'server-error',
      message: '리뷰 가능한 약속 목록을 불러오지 못했습니다.',
    });
  });

  it('키셋 커서를 계산해 리뷰 가능 목록을 반환한다', async () => {
    const supabase = {
      rpc: jest.fn().mockResolvedValue({
        data: [
          {
            appointment_id: '20000000-0000-4000-8000-000000000201',
            title: '약속 1',
            start_at: '2026-02-24T10:00:00.000Z',
            ends_at: '2026-02-24T12:00:00.000Z',
            place_id: '20000000-0000-4000-8000-000000000301',
            place_name: '장소 1',
            review_avg: 4.2,
            review_count: 10,
          },
          {
            appointment_id: '20000000-0000-4000-8000-000000000202',
            title: '약속 2',
            start_at: '2026-02-23T10:00:00.000Z',
            ends_at: '2026-02-23T12:00:00.000Z',
            place_id: '20000000-0000-4000-8000-000000000302',
            place_name: '장소 2',
            review_avg: null,
            review_count: 0,
          },
          {
            appointment_id: '20000000-0000-4000-8000-000000000203',
            title: '약속 3',
            start_at: '2026-02-22T10:00:00.000Z',
            ends_at: '2026-02-22T12:00:00.000Z',
            place_id: '20000000-0000-4000-8000-000000000303',
            place_name: '장소 3',
            review_avg: 3.7,
            review_count: 4,
          },
        ],
        error: null,
      }),
    };

    mockRequireUser.mockResolvedValue({
      ok: true,
      supabase,
      user: { id: '20000000-0000-4000-8000-000000000001' },
    });

    const result = await listReviewableAppointmentsAction({
      limit: 2,
      cursor: {
        endsAt: '2026-02-25T12:00:00.000Z',
        appointmentId: '20000000-0000-4000-8000-000000000299',
      },
    });

    expect(supabase.rpc).toHaveBeenCalledWith(
      'list_reviewable_appointments_with_stats_cursor',
      {
        p_user_id: '20000000-0000-4000-8000-000000000001',
        p_limit: 2,
        p_cursor_ends_at: '2026-02-25T12:00:00.000Z',
        p_cursor_appointment_id: '20000000-0000-4000-8000-000000000299',
      },
    );
    expect(result).toEqual({
      ok: true,
      data: {
        appointments: [
          {
            appointmentId: '20000000-0000-4000-8000-000000000201',
            title: '약속 1',
            startAt: '2026-02-24T10:00:00.000Z',
            endsAt: '2026-02-24T12:00:00.000Z',
            placeId: '20000000-0000-4000-8000-000000000301',
            placeName: '장소 1',
            reviewAverage: 4.2,
            reviewCount: 10,
          },
          {
            appointmentId: '20000000-0000-4000-8000-000000000202',
            title: '약속 2',
            startAt: '2026-02-23T10:00:00.000Z',
            endsAt: '2026-02-23T12:00:00.000Z',
            placeId: '20000000-0000-4000-8000-000000000302',
            placeName: '장소 2',
            reviewAverage: null,
            reviewCount: 0,
          },
        ],
        nextCursor: {
          endsAt: '2026-02-23T12:00:00.000Z',
          appointmentId: '20000000-0000-4000-8000-000000000202',
        },
      },
    });
  });
});
