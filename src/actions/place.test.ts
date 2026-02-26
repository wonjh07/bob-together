import { requireUser } from '@/actions/_common/guards';

import {
  getPlaceDetailAction,
  listPlaceReviewsAction,
  searchPlacesAction,
} from './place';

jest.mock('@/actions/_common/guards', () => {
  const actual = jest.requireActual('@/actions/_common/guards');

  return {
    ...actual,
    requireUser: jest.fn(),
  };
});

describe('searchPlacesAction', () => {
  it('검색어가 짧으면 invalid-format을 반환한다', async () => {
    const result = await searchPlacesAction({ query: 'a' });

    expect(result).toEqual({
      ok: false,
      error: 'invalid-format',
      message: '검색어를 2자 이상 입력해주세요.',
    });
  });

  it('위도/경도 중 하나만 전달되면 invalid-format을 반환한다', async () => {
    const result = await searchPlacesAction({
      query: '스타벅스',
      latitude: 37.5,
    });

    expect(result).toEqual({
      ok: false,
      error: 'invalid-format',
      message: '위도와 경도는 함께 전달되어야 합니다.',
    });
  });

  it('외부 API 호출 예외 시 server-error를 반환한다', async () => {
    const originalKey = process.env.KAKAO_REST_API_KEY;
    process.env.KAKAO_REST_API_KEY = 'test-key';
    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);
    const originalFetch = (globalThis as { fetch?: typeof fetch }).fetch;
    const mockFetch = jest.fn().mockRejectedValue(new Error('network down'));
    (globalThis as { fetch?: typeof fetch }).fetch =
      mockFetch as unknown as typeof fetch;

    try {
      const result = await searchPlacesAction({ query: '스타벅스' });

      expect(result).toEqual({
        ok: false,
        error: 'server-error',
        message: '장소 검색 중 오류가 발생했습니다.',
      });
    } finally {
      consoleErrorSpy.mockRestore();
      process.env.KAKAO_REST_API_KEY = originalKey;
      if (originalFetch) {
        (globalThis as { fetch?: typeof fetch }).fetch = originalFetch;
      } else {
        delete (globalThis as { fetch?: typeof fetch }).fetch;
      }
    }
  });
});

describe('getPlaceDetailAction', () => {
  const mockRequireUser = requireUser as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('placeId 형식이 올바르지 않으면 invalid-format을 반환한다', async () => {
    const result = await getPlaceDetailAction('invalid-place-id');

    expect(result).toEqual({
      ok: false,
      error: 'invalid-format',
      message: '유효한 장소 ID가 아닙니다.',
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

    const result = await getPlaceDetailAction(
      '20000000-0000-4000-8000-000000000010',
    );

    expect(result).toEqual({
      ok: false,
      error: 'server-error',
      message: '장소 정보를 찾을 수 없습니다.',
    });
  });

  it('장소 상세와 리뷰 통계를 매핑한다', async () => {
    const placeId = '20000000-0000-4000-8000-000000000010';
    const supabase = {
      rpc: jest.fn().mockResolvedValue({
        data: [
          {
            place_id: placeId,
            name: '테스트 카페',
            address: '서울시 강남구',
            category: '카페',
            latitude: 37.5,
            longitude: 127.0,
            review_avg: '4.3333',
            review_count: '3',
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

    const result = await getPlaceDetailAction(placeId);

    expect(supabase.rpc).toHaveBeenCalledWith(
      'get_place_detail_with_stats',
      {
        p_place_id: placeId,
      },
    );

    expect(result).toEqual({
      ok: true,
      data: {
        place: {
          placeId,
          name: '테스트 카페',
          address: '서울시 강남구',
          category: '카페',
          latitude: 37.5,
          longitude: 127.0,
          reviewAverage: 4.3,
          reviewCount: 3,
        },
      },
    });
  });
});

describe('listPlaceReviewsAction', () => {
  const mockRequireUser = requireUser as jest.Mock;
  const placeId = '20000000-0000-4000-8000-000000000010';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('cursor 형식이 올바르지 않으면 invalid-format을 반환한다', async () => {
    const result = await listPlaceReviewsAction({
      placeId,
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

    const result = await listPlaceReviewsAction({ placeId, limit: 2 });

    expect(result).toEqual({
      ok: false,
      error: 'server-error',
      message: '장소 리뷰를 불러오지 못했습니다.',
    });
  });

  it('키셋 커서를 계산해 리뷰 목록을 반환한다', async () => {
    const supabase = {
      rpc: jest.fn().mockResolvedValue({
        data: [
          {
            review_id: '20000000-0000-4000-8000-000000000101',
            user_id: '20000000-0000-4000-8000-000000000201',
            score: 5,
            review: '좋아요',
            edited_at: null,
            updated_at: '2026-02-25T10:03:00.000Z',
            user_name: '사용자1',
            user_nickname: 'user1',
            user_profile_image: null,
          },
          {
            review_id: '20000000-0000-4000-8000-000000000102',
            user_id: '20000000-0000-4000-8000-000000000202',
            score: 4,
            review: '괜찮아요',
            edited_at: '2026-02-25T10:02:30.000Z',
            updated_at: '2026-02-25T10:02:00.000Z',
            user_name: '사용자2',
            user_nickname: 'user2',
            user_profile_image: 'https://example.com/u2.png',
          },
          {
            review_id: '20000000-0000-4000-8000-000000000103',
            user_id: '20000000-0000-4000-8000-000000000203',
            score: 3,
            review: '보통',
            edited_at: null,
            updated_at: '2026-02-25T10:01:00.000Z',
            user_name: '사용자3',
            user_nickname: 'user3',
            user_profile_image: null,
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

    const result = await listPlaceReviewsAction({
      placeId,
      limit: 2,
      cursor: {
        updatedAt: '2026-02-25T10:05:00.000Z',
        reviewId: '20000000-0000-4000-8000-000000000199',
      },
    });

    expect(supabase.rpc).toHaveBeenCalledWith(
      'list_place_reviews_with_cursor',
      {
        p_place_id: placeId,
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
            reviewId: '20000000-0000-4000-8000-000000000101',
            userId: '20000000-0000-4000-8000-000000000201',
            userName: '사용자1',
            userNickname: 'user1',
            userProfileImage: null,
            score: 5,
            content: '좋아요',
            editedAt: '2026-02-25T10:03:00.000Z',
          },
          {
            reviewId: '20000000-0000-4000-8000-000000000102',
            userId: '20000000-0000-4000-8000-000000000202',
            userName: '사용자2',
            userNickname: 'user2',
            userProfileImage: 'https://example.com/u2.png',
            score: 4,
            content: '괜찮아요',
            editedAt: '2026-02-25T10:02:30.000Z',
          },
        ],
        nextCursor: {
          updatedAt: '2026-02-25T10:02:00.000Z',
          reviewId: '20000000-0000-4000-8000-000000000102',
        },
      },
    });
  });
});
