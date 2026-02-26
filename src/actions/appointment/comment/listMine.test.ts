import { requireUser } from '@/actions/_common/guards';

import { listMyCommentsAction } from './listMine';

jest.mock('@/actions/_common/guards', () => {
  const actual = jest.requireActual('@/actions/_common/guards');

  return {
    ...actual,
    requireUser: jest.fn(),
  };
});

describe('listMyCommentsAction', () => {
  const mockRequireUser = requireUser as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('유효하지 않은 cursor가 들어오면 invalid-format을 반환한다', async () => {
    const result = await listMyCommentsAction({
      cursor: {
        createdAt: 'invalid-date',
        commentId: '20000000-0000-4000-8000-000000000002',
      },
    });

    expect(result).toEqual({
      ok: false,
      error: 'invalid-format',
      message: '유효한 커서 정보가 아닙니다.',
    });
  });

  it('RPC 에러면 server-error를 반환한다', async () => {
    const rpc = jest.fn().mockResolvedValue({
      data: null,
      error: { message: 'rpc failed' },
    });
    const supabase = { rpc };

    mockRequireUser.mockResolvedValue({
      ok: true,
      supabase,
      user: { id: '20000000-0000-4000-8000-000000000001' },
    });

    const result = await listMyCommentsAction();

    expect(result).toEqual({
      ok: false,
      error: 'server-error',
      message: '내 댓글 목록을 불러오지 못했습니다.',
    });
  });

  it('RPC 키셋 커서를 적용하고 nextCursor를 계산한다', async () => {
    const rpc = jest.fn().mockResolvedValue({
      data: [
        {
          comment_id: '20000000-0000-4000-8000-000000000101',
          appointment_id: '20000000-0000-4000-8000-000000000201',
          content: '첫 댓글',
          created_at: '2026-02-25T10:03:00.000Z',
          appointment_title: '약속 1',
        },
        {
          comment_id: '20000000-0000-4000-8000-000000000102',
          appointment_id: '20000000-0000-4000-8000-000000000202',
          content: '둘째 댓글',
          created_at: '2026-02-25T10:02:00.000Z',
          appointment_title: '약속 2',
        },
        {
          comment_id: '20000000-0000-4000-8000-000000000103',
          appointment_id: '20000000-0000-4000-8000-000000000203',
          content: '셋째 댓글',
          created_at: '2026-02-25T10:01:00.000Z',
          appointment_title: '약속 3',
        },
      ],
      error: null,
    });
    const supabase = {
      rpc,
    };

    mockRequireUser.mockResolvedValue({
      ok: true,
      supabase,
      user: { id: '20000000-0000-4000-8000-000000000001' },
    });

    const result = await listMyCommentsAction({
      cursor: {
        createdAt: '2026-02-25T10:05:00.000Z',
        commentId: '20000000-0000-4000-8000-000000000199',
      },
      limit: 2,
    });

    expect(rpc).toHaveBeenCalledWith(
      'list_my_comments_with_cursor',
      {
        p_limit: 2,
        p_cursor_created_at: '2026-02-25T10:05:00.000Z',
        p_cursor_comment_id: '20000000-0000-4000-8000-000000000199',
      },
    );
    expect(result).toEqual({
      ok: true,
      data: {
        comments: [
          {
            commentId: '20000000-0000-4000-8000-000000000101',
            appointmentId: '20000000-0000-4000-8000-000000000201',
            appointmentTitle: '약속 1',
            content: '첫 댓글',
            createdAt: '2026-02-25T10:03:00.000Z',
          },
          {
            commentId: '20000000-0000-4000-8000-000000000102',
            appointmentId: '20000000-0000-4000-8000-000000000202',
            appointmentTitle: '약속 2',
            content: '둘째 댓글',
            createdAt: '2026-02-25T10:02:00.000Z',
          },
        ],
        nextCursor: {
          createdAt: '2026-02-25T10:02:00.000Z',
          commentId: '20000000-0000-4000-8000-000000000102',
        },
      },
    });
  });
});
