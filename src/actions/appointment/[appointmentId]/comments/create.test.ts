import { requireUser } from '@/actions/_common/guards';

import { createAppointmentCommentAction } from './create';

jest.mock('@/actions/_common/guards', () => {
  const actual = jest.requireActual('@/actions/_common/guards');

  return {
    ...actual,
    requireUser: jest.fn(),
  };
});

describe('createAppointmentCommentAction', () => {
  const mockRequireUser = requireUser as jest.Mock;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('빈 댓글은 invalid-format을 반환한다', async () => {
    const result = await createAppointmentCommentAction({
      appointmentId: '550e8400-e29b-41d4-a716-446655440000',
      content: '   ',
    });

    expect(result).toEqual({
      ok: false,
      error: 'invalid-format',
      message: '댓글을 입력해주세요.',
    });
  });

  it('예상치 못한 DB 오류면 server-error를 반환한다', async () => {
    const insertQuery = {
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: null,
        error: {
          code: 'XX000',
          message: 'unexpected',
          details: null,
          hint: null,
        },
      }),
    };
    const supabase = {
      from: jest.fn().mockReturnValue(insertQuery),
    };

    mockRequireUser.mockResolvedValue({
      ok: true,
      supabase,
      user: { id: '550e8400-e29b-41d4-a716-446655440100' },
    });

    const result = await createAppointmentCommentAction({
      appointmentId: '550e8400-e29b-41d4-a716-446655440000',
      content: '테스트 댓글',
    });

    expect(result).toEqual({
      ok: false,
      error: 'server-error',
      message: '댓글 작성 중 오류가 발생했습니다.',
    });
  });
});
