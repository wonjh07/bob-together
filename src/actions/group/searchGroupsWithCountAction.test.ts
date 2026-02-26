import { requireUser } from '@/actions/_common/guards';

import { searchGroupsWithCountAction } from './searchGroupsWithCountAction';

jest.mock('@/actions/_common/guards', () => {
  const actual = jest.requireActual('@/actions/_common/guards');

  return {
    ...actual,
    requireUser: jest.fn(),
  };
});

describe('searchGroupsWithCountAction', () => {
  const mockRequireUser = requireUser as jest.Mock;
  const userId = '20000000-0000-4000-8000-000000000001';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('검색어가 짧으면 invalid-format을 반환한다', async () => {
    const result = await searchGroupsWithCountAction({
      query: 'a',
    });

    expect(result).toEqual({
      ok: false,
      error: 'invalid-format',
      message: '검색어를 2자 이상 입력해주세요.',
    });
  });

  it('인증 실패는 그대로 반환한다', async () => {
    mockRequireUser.mockResolvedValue({
      ok: false,
      error: 'unauthorized',
      message: '로그인이 필요합니다.',
    });

    const result = await searchGroupsWithCountAction({
      query: '점심',
    });

    expect(result).toEqual({
      ok: false,
      error: 'unauthorized',
      message: '로그인이 필요합니다.',
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

    const result = await searchGroupsWithCountAction({
      query: '점심',
      limit: 2,
    });

    expect(result).toEqual({
      ok: false,
      error: 'server-error',
      message: '그룹 검색 중 오류가 발생했습니다.',
    });
  });

  it('검색 결과를 매핑하고 nextCursor를 계산한다', async () => {
    const supabase = {
      rpc: jest.fn().mockResolvedValue({
        data: [
          {
            group_id: '20000000-0000-4000-8000-000000000101',
            group_name: '점심팟',
            owner_name: '홍길동',
            owner_nickname: '길동',
            owner_profile_image: null,
            member_count: 3,
            is_member: true,
          },
          {
            group_id: '20000000-0000-4000-8000-000000000102',
            group_name: '저녁팟',
            owner_name: '김철수',
            owner_nickname: null,
            owner_profile_image: 'https://example.com/profile.png',
            member_count: 2,
            is_member: false,
          },
          {
            group_id: '20000000-0000-4000-8000-000000000103',
            group_name: '아침팟',
            owner_name: null,
            owner_nickname: null,
            owner_profile_image: null,
            member_count: 1,
            is_member: false,
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

    const result = await searchGroupsWithCountAction({
      query: '점심',
      limit: 2,
      cursor: {
        name: '중간팟',
        groupId: '20000000-0000-4000-8000-000000000199',
      },
    });

    expect(supabase.rpc).toHaveBeenCalledWith('search_groups_with_count', {
      p_user_id: userId,
      p_query: '점심',
      p_limit: 2,
      p_cursor_name: '중간팟',
      p_cursor_group_id: '20000000-0000-4000-8000-000000000199',
    });
    expect(result).toEqual({
      ok: true,
      data: {
        groups: [
          {
            groupId: '20000000-0000-4000-8000-000000000101',
            title: '점심팟',
            name: '길동',
            ownerProfileImage: null,
            memberCount: 3,
            isMember: true,
          },
          {
            groupId: '20000000-0000-4000-8000-000000000102',
            title: '저녁팟',
            name: '김철수',
            ownerProfileImage: 'https://example.com/profile.png',
            memberCount: 2,
            isMember: false,
          },
        ],
        nextCursor: {
          name: '저녁팟',
          groupId: '20000000-0000-4000-8000-000000000102',
        },
      },
    });
  });
});
