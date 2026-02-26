import { requireUser } from '@/actions/_common/guards';

import { listMyGroupsWithStatsAction } from './listMyGroupsWithStatsAction';

jest.mock('@/actions/_common/guards', () => {
  const actual = jest.requireActual('@/actions/_common/guards');

  return {
    ...actual,
    requireUser: jest.fn(),
  };
});

describe('listMyGroupsWithStatsAction', () => {
  const mockRequireUser = requireUser as jest.Mock;
  const userId = '20000000-0000-4000-8000-000000000001';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('cursor 형식이 올바르지 않으면 invalid-format을 반환한다', async () => {
    const result = await listMyGroupsWithStatsAction({
      cursor: {
        joinedAt: 'invalid-date',
        groupId: '20000000-0000-4000-8000-000000000101',
      },
    });

    expect(result).toEqual({
      ok: false,
      error: 'invalid-format',
      message: '유효한 커서 정보가 아닙니다.',
    });
  });

  it('RPC 실패 시 server-error를 반환한다', async () => {
    const supabase = {
      rpc: jest.fn().mockResolvedValue({
        data: null,
        error: { message: 'rpc failed' },
      }),
    };

    mockRequireUser.mockResolvedValue({
      ok: true,
      supabase,
      user: { id: userId },
    });

    const result = await listMyGroupsWithStatsAction({ limit: 2 });

    expect(result).toEqual({
      ok: false,
      error: 'server-error',
      message: '그룹 관리 목록을 불러오지 못했습니다.',
    });
  });

  it('결과를 매핑하고 nextCursor를 계산한다', async () => {
    const supabase = {
      rpc: jest.fn().mockResolvedValue({
        data: [
          {
            group_id: '20000000-0000-4000-8000-000000000101',
            group_name: '점심팟',
            owner_name: '홍길동',
            owner_nickname: '길동',
            owner_profile_image: null,
            joined_at: '2026-02-25T10:00:00.000Z',
            created_at: '2026-02-01T10:00:00.000Z',
            member_count: 3,
            is_owner: true,
          },
          {
            group_id: '20000000-0000-4000-8000-000000000102',
            group_name: '저녁팟',
            owner_name: '김철수',
            owner_nickname: null,
            owner_profile_image: 'https://example.com/profile.png',
            joined_at: '2026-02-24T10:00:00.000Z',
            created_at: '2026-01-20T10:00:00.000Z',
            member_count: 2,
            is_owner: false,
          },
          {
            group_id: '20000000-0000-4000-8000-000000000103',
            group_name: '아침팟',
            owner_name: null,
            owner_nickname: null,
            owner_profile_image: null,
            joined_at: '2026-02-23T10:00:00.000Z',
            created_at: '2026-01-10T10:00:00.000Z',
            member_count: 1,
            is_owner: false,
          },
        ],
        error: null,
      }),
    };

    mockRequireUser.mockResolvedValue({
      ok: true,
      supabase,
      user: { id: userId },
    });

    const result = await listMyGroupsWithStatsAction({
      limit: 2,
      cursor: {
        joinedAt: '2026-02-26T10:00:00.000Z',
        groupId: '20000000-0000-4000-8000-000000000199',
      },
    });

    expect(supabase.rpc).toHaveBeenCalledWith('list_my_groups_with_stats', {
      p_user_id: userId,
      p_limit: 2,
      p_cursor_joined_at: '2026-02-26T10:00:00.000Z',
      p_cursor_group_id: '20000000-0000-4000-8000-000000000199',
    });
    expect(result).toEqual({
      ok: true,
      data: {
        groups: [
          {
            groupId: '20000000-0000-4000-8000-000000000101',
            groupName: '점심팟',
            ownerName: '홍길동',
            ownerNickname: '길동',
            ownerProfileImage: null,
            joinedAt: '2026-02-25T10:00:00.000Z',
            createdAt: '2026-02-01T10:00:00.000Z',
            memberCount: 3,
            isOwner: true,
          },
          {
            groupId: '20000000-0000-4000-8000-000000000102',
            groupName: '저녁팟',
            ownerName: '김철수',
            ownerNickname: null,
            ownerProfileImage: 'https://example.com/profile.png',
            joinedAt: '2026-02-24T10:00:00.000Z',
            createdAt: '2026-01-20T10:00:00.000Z',
            memberCount: 2,
            isOwner: false,
          },
        ],
        nextCursor: {
          joinedAt: '2026-02-24T10:00:00.000Z',
          groupId: '20000000-0000-4000-8000-000000000102',
        },
      },
    });
  });
});
