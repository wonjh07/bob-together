import { requireUser } from '@/actions/_common/guards';

import { getAppointmentReviewTargetAction } from './getTarget';

jest.mock('@/actions/_common/guards', () => {
  const actual = jest.requireActual('@/actions/_common/guards');

  return {
    ...actual,
    requireUser: jest.fn(),
  };
});

const APPOINTMENT_ID = '20000000-0000-4000-8000-000000000001';
const USER_ID = '20000000-0000-4000-8000-000000000002';

describe('getAppointmentReviewTargetAction', () => {
  const mockRequireUser = requireUser as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('약속 ID 형식이 올바르지 않으면 invalid-format을 반환한다', async () => {
    const result = await getAppointmentReviewTargetAction('invalid-id');

    expect(result).toEqual({
      ok: false,
      error: 'invalid-format',
      message: '유효한 약속 정보가 필요합니다.',
    });
  });

  it('종료되지 않은 약속이면 forbidden을 반환한다', async () => {
    const rpc = jest.fn().mockResolvedValue({
      data: [
        {
          ok: false,
          error_code: 'forbidden-not-ended',
        },
      ],
      error: null,
    });

    mockRequireUser.mockResolvedValue({
      ok: true,
      supabase: { rpc },
      user: { id: USER_ID },
    });

    const result = await getAppointmentReviewTargetAction(APPOINTMENT_ID);

    expect(result).toEqual({
      ok: false,
      error: 'forbidden',
      message: '종료된 약속만 리뷰를 작성할 수 있습니다.',
    });
  });

  it('리뷰 대상 데이터를 반환한다', async () => {
    const rpc = jest.fn().mockResolvedValue({
      data: [
        {
          ok: true,
          error_code: null,
          appointment_id: APPOINTMENT_ID,
          title: '테스트 약속',
          start_at: '2026-02-01T09:00:00.000Z',
          ends_at: '2026-02-01T10:00:00.000Z',
          place_id: '20000000-0000-4000-8000-000000000003',
          place_name: '테스트 장소',
          place_address: '서울시',
          place_category: '한식',
          review_avg: 4.3,
          review_count: 12,
          my_score: 5,
          my_review: '좋았어요',
          has_my_review_row: true,
          has_reviewed: true,
        },
      ],
      error: null,
    });

    mockRequireUser.mockResolvedValue({
      ok: true,
      supabase: { rpc },
      user: { id: USER_ID },
    });

    const result = await getAppointmentReviewTargetAction(APPOINTMENT_ID);

    expect(result).toEqual({
      ok: true,
      data: {
        target: {
          appointmentId: APPOINTMENT_ID,
          title: '테스트 약속',
          startAt: '2026-02-01T09:00:00.000Z',
          endsAt: '2026-02-01T10:00:00.000Z',
          place: {
            placeId: '20000000-0000-4000-8000-000000000003',
            name: '테스트 장소',
            address: '서울시',
            category: '한식',
            reviewAverage: 4.3,
            reviewCount: 12,
          },
          myReview: {
            score: 5,
            content: '좋았어요',
          },
          hasReviewed: true,
          canWriteReview: true,
        },
      },
    });
  });
});
