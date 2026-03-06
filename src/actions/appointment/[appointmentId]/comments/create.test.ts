import { requireUserService } from '@/actions/_common/guards';

import { createAppointmentCommentAction } from './create';

jest.mock('@/actions/_common/guards', () => {
  const actual = jest.requireActual('@/actions/_common/guards');

  return {
    ...actual,
    requireUserService: jest.fn(),
  };
});

describe('createAppointmentCommentAction', () => {
  const mockRequireUserService = requireUserService as jest.Mock;
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

    expect(result).toMatchObject({
      ok: false,
      errorType: 'validation',
      message: '댓글을 입력해주세요.',
      fieldErrors: {
        content: ['댓글을 입력해주세요.'],
      },
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

    mockRequireUserService.mockResolvedValue({
      ok: true,
      supabase,
      user: { id: '550e8400-e29b-41d4-a716-446655440100' },
      requestId: 'req-test',
    });

    const result = await createAppointmentCommentAction({
      appointmentId: '550e8400-e29b-41d4-a716-446655440000',
      content: '테스트 댓글',
    });

    expect(result).toMatchObject({
      ok: false,
      errorType: 'server',
      message: '댓글 작성 중 오류가 발생했습니다.',
    });
  });

  it('성공 시 통일된 mutation payload를 반환한다', async () => {
    const appointmentId = '550e8400-e29b-41d4-a716-446655440000';
    const userId = '550e8400-e29b-41d4-a716-446655440100';
    const insertQuery = {
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: {
          comment_id: '550e8400-e29b-41d4-a716-446655440200',
          content: '테스트 댓글',
          created_at: '2026-03-02T10:00:00.000Z',
          user_id: userId,
          users: {
            name: '홍길동',
            nickname: '길동',
            profile_image: null,
          },
        },
        error: null,
      }),
    };
    const supabase = {
      from: jest.fn().mockReturnValue(insertQuery),
    };

    mockRequireUserService.mockResolvedValue({
      ok: true,
      supabase,
      user: { id: userId },
      requestId: 'req-test',
    });

    const result = await createAppointmentCommentAction({
      appointmentId,
      content: '테스트 댓글',
    });

    expect(result).toMatchObject({
      ok: true,
      data: {
        appointmentId,
        commentId: '550e8400-e29b-41d4-a716-446655440200',
        comment: {
          commentId: '550e8400-e29b-41d4-a716-446655440200',
          content: '테스트 댓글',
          createdAt: '2026-03-02T10:00:00.000Z',
          userId,
          name: '홍길동',
          nickname: '길동',
          profileImage: null,
        },
        commentCountDelta: 1,
      },
    });
  });
});
