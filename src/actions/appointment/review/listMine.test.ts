import { requireUser } from '@/actions/_common/guards';

import { listMyReviewsAction } from './listMine';

jest.mock('@/actions/_common/guards', () => {
  const actual = jest.requireActual('@/actions/_common/guards');

  return {
    ...actual,
    requireUser: jest.fn(),
  };
});

describe('listMyReviewsAction', () => {
  const mockRequireUser = requireUser as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('유효하지 않은 cursor가 들어오면 invalid-format을 반환한다', async () => {
    const result = await listMyReviewsAction({
      cursor: {
        updatedAt: 'invalid-date',
        reviewId: '20000000-0000-4000-8000-000000000101',
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

    const result = await listMyReviewsAction({
      limit: 2,
    });

    expect(result).toEqual({
      ok: false,
      error: 'server-error',
      message: '내 리뷰 목록을 불러오지 못했습니다.',
    });
  });

  it('키셋 커서를 계산해 내 리뷰 목록을 반환한다', async () => {
    const supabase = {
      rpc: jest.fn().mockResolvedValue({
        data: [
          {
            review_id: '20000000-0000-4000-8000-000000000101',
            appointment_id: '20000000-0000-4000-8000-000000000201',
            place_id: '20000000-0000-4000-8000-000000000301',
            score: 5,
            review: '좋아요',
            edited_at: null,
            created_at: '2026-02-25T10:03:00.000Z',
            updated_at: '2026-02-25T10:03:00.000Z',
            place_name: '장소 1',
          },
          {
            review_id: '20000000-0000-4000-8000-000000000102',
            appointment_id: '20000000-0000-4000-8000-000000000202',
            place_id: '20000000-0000-4000-8000-000000000302',
            score: 4,
            review: '괜찮아요',
            edited_at: '2026-02-25T10:02:30.000Z',
            created_at: '2026-02-25T10:02:00.000Z',
            updated_at: '2026-02-25T10:02:30.000Z',
            place_name: '장소 2',
          },
          {
            review_id: '20000000-0000-4000-8000-000000000103',
            appointment_id: '20000000-0000-4000-8000-000000000203',
            place_id: '20000000-0000-4000-8000-000000000303',
            score: 3,
            review: '보통',
            edited_at: null,
            created_at: '2026-02-25T10:01:00.000Z',
            updated_at: '2026-02-25T10:01:00.000Z',
            place_name: '장소 3',
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

    const result = await listMyReviewsAction({
      limit: 2,
      cursor: {
        updatedAt: '2026-02-25T10:05:00.000Z',
        reviewId: '20000000-0000-4000-8000-000000000199',
      },
    });

    expect(supabase.rpc).toHaveBeenCalledWith(
      'list_my_reviews_with_cursor',
      {
        p_limit: 2,
        p_cursor_updated_at: '2026-02-25T10:05:00.000Z',
        p_cursor_review_id: '20000000-0000-4000-8000-000000000199',
      },
    );
    expect(result).toEqual({
      ok: true,
      data: {
        reviews: [
          {
            appointmentId: '20000000-0000-4000-8000-000000000201',
            placeId: '20000000-0000-4000-8000-000000000301',
            placeName: '장소 1',
            score: 5,
            content: '좋아요',
            editedAt: '2026-02-25T10:03:00.000Z',
          },
          {
            appointmentId: '20000000-0000-4000-8000-000000000202',
            placeId: '20000000-0000-4000-8000-000000000302',
            placeName: '장소 2',
            score: 4,
            content: '괜찮아요',
            editedAt: '2026-02-25T10:02:30.000Z',
          },
        ],
        nextCursor: {
          updatedAt: '2026-02-25T10:02:30.000Z',
          reviewId: '20000000-0000-4000-8000-000000000102',
        },
      },
    });
  });
});
