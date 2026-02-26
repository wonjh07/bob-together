import { requireUser } from '@/actions/_common/guards';

import { deleteMyReviewAction } from './delete';

jest.mock('@/actions/_common/guards', () => {
  const actual = jest.requireActual('@/actions/_common/guards');

  return {
    ...actual,
    requireUser: jest.fn(),
  };
});

const APPOINTMENT_ID = '20000000-0000-4000-8000-000000000001';
const USER_ID = '20000000-0000-4000-8000-000000000002';

describe('deleteMyReviewAction', () => {
  const mockRequireUser = requireUser as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('약속 ID 형식이 올바르지 않으면 invalid-format을 반환한다', async () => {
    const result = await deleteMyReviewAction({
      appointmentId: 'invalid-id',
    });

    expect(result).toEqual({
      ok: false,
      error: 'invalid-format',
      message: '유효한 약속 정보가 필요합니다.',
    });
  });

  it('조회 단계에서 RPC 에러 코드가 오면 확인 실패 메시지를 반환한다', async () => {
    const rpc = jest.fn().mockResolvedValue({
      data: [
        {
          ok: false,
          error_code: 'server-error-read',
          appointment_id: null,
        },
      ],
      error: null,
    });

    mockRequireUser.mockResolvedValue({
      ok: true,
      supabase: { rpc },
      user: { id: USER_ID },
    });

    const result = await deleteMyReviewAction({
      appointmentId: APPOINTMENT_ID,
    });

    expect(result).toEqual({
      ok: false,
      error: 'server-error',
      message: '리뷰 정보를 확인하지 못했습니다.',
    });
  });

  it('삭제 RPC가 성공하면 appointmentId를 포함해 성공 응답을 반환한다', async () => {
    const rpc = jest.fn().mockResolvedValue({
      data: [
        {
          ok: true,
          error_code: null,
          appointment_id: APPOINTMENT_ID,
        },
      ],
      error: null,
    });

    mockRequireUser.mockResolvedValue({
      ok: true,
      supabase: { rpc },
      user: { id: USER_ID },
    });

    const result = await deleteMyReviewAction({
      appointmentId: APPOINTMENT_ID,
    });

    expect(rpc).toHaveBeenCalledWith('delete_my_review_transactional', {
      p_user_id: USER_ID,
      p_appointment_id: APPOINTMENT_ID,
      p_edited_at: expect.any(String),
    });
    expect(result).toEqual({
      ok: true,
      data: {
        appointmentId: APPOINTMENT_ID,
      },
    });
  });
});
