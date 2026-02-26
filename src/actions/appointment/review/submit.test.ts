import { requireUser } from '@/actions/_common/guards';

import { submitPlaceReviewAction } from './submit';

jest.mock('@/actions/_common/guards', () => {
  const actual = jest.requireActual('@/actions/_common/guards');

  return {
    ...actual,
    requireUser: jest.fn(),
  };
});

const APPOINTMENT_ID = '20000000-0000-4000-8000-000000000001';
const PLACE_ID = '20000000-0000-4000-8000-000000000003';
const USER_ID = '20000000-0000-4000-8000-000000000002';

describe('submitPlaceReviewAction', () => {
  const mockRequireUser = requireUser as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('약속 ID 형식이 올바르지 않으면 invalid-format을 반환한다', async () => {
    const result = await submitPlaceReviewAction({
      appointmentId: 'invalid-id',
      score: 5,
      content: '좋아요',
    });

    expect(result).toEqual({
      ok: false,
      error: 'invalid-format',
      message: '유효한 약속 정보가 필요합니다.',
    });
  });

  it('리뷰 대상 약속이 없으면 forbidden을 반환한다', async () => {
    const rpc = jest.fn().mockResolvedValue({
      data: [
        {
          ok: false,
          error_code: 'forbidden-not-found',
          appointment_id: null,
          place_id: null,
          mode: null,
        },
      ],
      error: null,
    });

    mockRequireUser.mockResolvedValue({
      ok: true,
      supabase: { rpc },
      user: { id: USER_ID },
    });

    const result = await submitPlaceReviewAction({
      appointmentId: APPOINTMENT_ID,
      score: 5,
      content: '좋아요',
    });

    expect(result).toEqual({
      ok: false,
      error: 'forbidden',
      message: '리뷰 대상 약속을 찾을 수 없습니다.',
    });
  });

  it('리뷰를 저장하면 mode를 포함해 성공 응답을 반환한다', async () => {
    const rpc = jest.fn().mockResolvedValue({
      data: [
        {
          ok: true,
          error_code: null,
          appointment_id: APPOINTMENT_ID,
          place_id: PLACE_ID,
          mode: 'created',
        },
      ],
      error: null,
    });

    mockRequireUser.mockResolvedValue({
      ok: true,
      supabase: { rpc },
      user: { id: USER_ID },
    });

    const result = await submitPlaceReviewAction({
      appointmentId: APPOINTMENT_ID,
      score: 5,
      content: '좋아요',
    });

    expect(result).toEqual({
      ok: true,
      data: {
        appointmentId: APPOINTMENT_ID,
        placeId: PLACE_ID,
        score: 5,
        content: '좋아요',
        mode: 'created',
      },
    });
  });
});
