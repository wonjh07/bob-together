import { requireUser } from '@/actions/_common/guards';

import { getAppointmentCommentsAction } from './list';

jest.mock('@/actions/_common/guards', () => {
  const actual = jest.requireActual('@/actions/_common/guards');

  return {
    ...actual,
    requireUser: jest.fn(),
  };
});

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

  it('댓글 조회 RPC가 실패하면 server-error를 반환한다', async () => {
    const rpc = jest.fn().mockResolvedValue({
      data: null,
      error: { message: 'failed' },
    });
    const supabase = { rpc };

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

    expect(rpc).toHaveBeenCalledWith('get_appointment_comments_with_cursor', {
      p_user_id: userId,
      p_appointment_id: appointmentId,
      p_limit: 2,
      p_cursor_created_at: '2026-02-25T10:10:00.000Z',
      p_cursor_comment_id: '20000000-0000-4000-8000-000000000199',
      p_include_count: false,
    });
    expect(result).toEqual({
      ok: false,
      error: 'server-error',
      message: '댓글을 불러오지 못했습니다.',
    });
  });

  it('첫 페이지에서 count를 조회하고 키셋 nextCursor를 반환한다', async () => {
    const rpc = jest.fn().mockResolvedValue({
      data: [
        {
          ok: true,
          error_code: null,
          comment_count: 12,
          comments: [
            {
              comment_id: '20000000-0000-4000-8000-000000000301',
              content: '최신 댓글',
              created_at: '2026-02-25T10:03:00.000Z',
              user_id: userId,
              name: '홍길동',
              nickname: '길동',
              profile_image: null,
            },
            {
              comment_id: '20000000-0000-4000-8000-000000000302',
              content: '이전 댓글',
              created_at: '2026-02-25T10:02:00.000Z',
              user_id: '20000000-0000-4000-8000-000000000999',
              name: '김철수',
              nickname: null,
              profile_image: null,
            },
            {
              comment_id: '20000000-0000-4000-8000-000000000303',
              content: '더 이전 댓글',
              created_at: '2026-02-25T10:01:00.000Z',
              user_id: userId,
              name: '홍길동',
              nickname: '길동',
              profile_image: null,
            },
          ],
        },
      ],
      error: null,
    });
    const supabase = { rpc };

    mockRequireUser.mockResolvedValue({
      ok: true,
      supabase,
      user: { id: userId },
    });

    const result = await getAppointmentCommentsAction({
      appointmentId,
      limit: 2,
    });

    expect(rpc).toHaveBeenCalledWith('get_appointment_comments_with_cursor', {
      p_user_id: userId,
      p_appointment_id: appointmentId,
      p_limit: 2,
      p_cursor_created_at: null,
      p_cursor_comment_id: null,
      p_include_count: true,
    });
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

  it('첫 페이지에서 count가 누락되면 server-error를 반환한다', async () => {
    const rpc = jest.fn().mockResolvedValue({
      data: [
        {
          ok: true,
          error_code: null,
          comment_count: null,
          comments: [],
        },
      ],
      error: null,
    });
    const supabase = { rpc };

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
    const rpc = jest.fn().mockResolvedValue({
      data: [
        {
          ok: true,
          error_code: null,
          comment_count: 0,
          comments: [
            {
              comment_id: '20000000-0000-4000-8000-000000000401',
              content: '최신 댓글',
              created_at: '2026-02-25T11:03:00.000Z',
              user_id: userId,
              name: '홍길동',
              nickname: '길동',
              profile_image: null,
            },
            {
              comment_id: '20000000-0000-4000-8000-000000000402',
              content: '이전 댓글',
              created_at: '2026-02-25T11:02:00.000Z',
              user_id: '20000000-0000-4000-8000-000000000999',
              name: '김철수',
              nickname: null,
              profile_image: null,
            },
          ],
        },
      ],
      error: null,
    });
    const supabase = { rpc };

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
