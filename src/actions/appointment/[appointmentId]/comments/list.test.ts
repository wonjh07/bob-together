import { requireUser } from '@/actions/_common/guards';

import { getAppointmentCommentsAction } from './list';

jest.mock('@/actions/_common/guards', () => {
  const actual = jest.requireActual('@/actions/_common/guards');

  return {
    ...actual,
    requireUser: jest.fn(),
  };
});

function createAwaitableQuery<T extends Record<string, unknown>>(result: T) {
  const query = {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    is: jest.fn().mockReturnThis(),
    or: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    maybeSingle: jest.fn().mockResolvedValue(result),
    then: (
      onFulfilled: (value: T) => unknown,
      onRejected?: (reason: unknown) => unknown,
    ) => Promise.resolve(result).then(onFulfilled, onRejected),
  };

  return query;
}

describe('getAppointmentCommentsAction', () => {
  const mockRequireUser = requireUser as jest.Mock;
  const userId = '20000000-0000-4000-8000-000000000001';
  const appointmentId = '20000000-0000-4000-8000-000000000101';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('잘못된 약속 ID 형식이면 invalid-format을 반환한다', async () => {
    const result = await getAppointmentCommentsAction({
      appointmentId: 'not-uuid',
    });

    expect(result).toEqual({
      ok: false,
      error: 'invalid-format',
      message: '유효한 약속 ID가 아닙니다.',
    });
  });

  it('댓글 조회가 실패하면 server-error를 반환한다', async () => {
    const commentsListQuery = createAwaitableQuery({
      data: null,
      error: { message: 'failed' },
    });
    const supabase = {
      from: jest.fn().mockReturnValue(commentsListQuery),
    };

    mockRequireUser.mockResolvedValue({
      ok: true,
      supabase,
      user: { id: userId },
    });

    const result = await getAppointmentCommentsAction({
      appointmentId,
      cursor: {
        createdAt: '2026-02-25T10:10:00.000Z',
        commentId: '20000000-0000-4000-8000-000000000199',
      },
      limit: 2,
    });

    expect(commentsListQuery.or).toHaveBeenCalledWith(
      'created_at.lt.2026-02-25T10:10:00.000Z,and(created_at.eq.2026-02-25T10:10:00.000Z,comment_id.lt.20000000-0000-4000-8000-000000000199)',
    );
    expect(result).toEqual({
      ok: false,
      error: 'server-error',
      message: '댓글을 불러오지 못했습니다.',
    });
  });

  it('첫 페이지에서 count를 조회하고 키셋 nextCursor를 반환한다', async () => {
    const appointmentQuery = createAwaitableQuery({
      data: { appointment_id: appointmentId },
      error: null,
    });
    const commentsListQuery = createAwaitableQuery({
      data: [
        {
          comment_id: '20000000-0000-4000-8000-000000000301',
          content: '최신 댓글',
          created_at: '2026-02-25T10:03:00.000Z',
          user_id: userId,
          users: {
            name: '홍길동',
            nickname: '길동',
            profile_image: null,
          },
        },
        {
          comment_id: '20000000-0000-4000-8000-000000000302',
          content: '이전 댓글',
          created_at: '2026-02-25T10:02:00.000Z',
          user_id: '20000000-0000-4000-8000-000000000999',
          users: {
            name: '김철수',
            nickname: null,
            profile_image: null,
          },
        },
        {
          comment_id: '20000000-0000-4000-8000-000000000303',
          content: '더 이전 댓글',
          created_at: '2026-02-25T10:01:00.000Z',
          user_id: userId,
          users: {
            name: '홍길동',
            nickname: '길동',
            profile_image: null,
          },
        },
      ],
      error: null,
      count: 12,
    });
    const supabase = {
      from: jest
        .fn()
        .mockReturnValueOnce(appointmentQuery)
        .mockReturnValueOnce(commentsListQuery),
    };

    mockRequireUser.mockResolvedValue({
      ok: true,
      supabase,
      user: { id: userId },
    });

    const result = await getAppointmentCommentsAction({
      appointmentId,
      limit: 2,
    });

    expect(commentsListQuery.select).toHaveBeenCalledWith(
      'comment_id, content, created_at, user_id, users(name, nickname, profile_image)',
      { count: 'exact' },
    );
    expect(commentsListQuery.limit).toHaveBeenCalledWith(3);
    expect(result).toEqual({
      ok: true,
      data: {
        commentCount: 12,
        comments: [
          {
            commentId: '20000000-0000-4000-8000-000000000302',
            content: '이전 댓글',
            createdAt: '2026-02-25T10:02:00.000Z',
            userId: '20000000-0000-4000-8000-000000000999',
            name: '김철수',
            nickname: null,
            profileImage: null,
          },
          {
            commentId: '20000000-0000-4000-8000-000000000301',
            content: '최신 댓글',
            createdAt: '2026-02-25T10:03:00.000Z',
            userId,
            name: '홍길동',
            nickname: '길동',
            profileImage: null,
          },
        ],
        nextCursor: {
          createdAt: '2026-02-25T10:02:00.000Z',
          commentId: '20000000-0000-4000-8000-000000000302',
        },
        currentUserId: userId,
      },
    });
  });

  it('count가 누락되면 server-error를 반환한다', async () => {
    const appointmentQuery = createAwaitableQuery({
      data: { appointment_id: appointmentId },
      error: null,
    });
    const commentsListQuery = createAwaitableQuery({
      data: [],
      error: null,
      count: null,
    });
    const supabase = {
      from: jest
        .fn()
        .mockReturnValueOnce(appointmentQuery)
        .mockReturnValueOnce(commentsListQuery),
    };

    mockRequireUser.mockResolvedValue({
      ok: true,
      supabase,
      user: { id: userId },
    });

    const result = await getAppointmentCommentsAction({
      appointmentId,
    });

    expect(result).toEqual({
      ok: false,
      error: 'server-error',
      message: '댓글 수를 불러오지 못했습니다.',
    });
  });

  it('커서 페이지에서는 count 없이도 댓글을 반환한다', async () => {
    const commentsListQuery = createAwaitableQuery({
      data: [
        {
          comment_id: '20000000-0000-4000-8000-000000000401',
          content: '최신 댓글',
          created_at: '2026-02-25T11:03:00.000Z',
          user_id: userId,
          users: {
            name: '홍길동',
            nickname: '길동',
            profile_image: null,
          },
        },
        {
          comment_id: '20000000-0000-4000-8000-000000000402',
          content: '이전 댓글',
          created_at: '2026-02-25T11:02:00.000Z',
          user_id: '20000000-0000-4000-8000-000000000999',
          users: {
            name: '김철수',
            nickname: null,
            profile_image: null,
          },
        },
      ],
      error: null,
    });
    const supabase = {
      from: jest.fn().mockReturnValue(commentsListQuery),
    };

    mockRequireUser.mockResolvedValue({
      ok: true,
      supabase,
      user: { id: userId },
    });

    const result = await getAppointmentCommentsAction({
      appointmentId,
      cursor: {
        createdAt: '2026-02-25T11:10:00.000Z',
        commentId: '20000000-0000-4000-8000-000000000499',
      },
      limit: 2,
    });

    expect(commentsListQuery.select).toHaveBeenCalledWith(
      'comment_id, content, created_at, user_id, users(name, nickname, profile_image)',
      undefined,
    );
    expect(result).toEqual({
      ok: true,
      data: {
        commentCount: 0,
        comments: [
          {
            commentId: '20000000-0000-4000-8000-000000000402',
            content: '이전 댓글',
            createdAt: '2026-02-25T11:02:00.000Z',
            userId: '20000000-0000-4000-8000-000000000999',
            name: '김철수',
            nickname: null,
            profileImage: null,
          },
          {
            commentId: '20000000-0000-4000-8000-000000000401',
            content: '최신 댓글',
            createdAt: '2026-02-25T11:03:00.000Z',
            userId,
            name: '홍길동',
            nickname: '길동',
            profileImage: null,
          },
        ],
        nextCursor: null,
        currentUserId: userId,
      },
    });
  });
});
