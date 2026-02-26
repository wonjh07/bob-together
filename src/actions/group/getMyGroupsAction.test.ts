import { requireUser } from '@/actions/_common/guards';

import { getMyGroupsAction } from './getMyGroupsAction';

jest.mock('@/actions/_common/guards', () => {
  const actual = jest.requireActual('@/actions/_common/guards');

  return {
    ...actual,
    requireUser: jest.fn(),
  };
});

describe('getMyGroupsAction', () => {
  const mockRequireUser = requireUser as jest.Mock;
  const userId = '20000000-0000-4000-8000-000000000001';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('인증 실패는 그대로 반환한다', async () => {
    mockRequireUser.mockResolvedValue({
      ok: false,
      error: 'unauthorized',
      message: '로그인이 필요합니다.',
    });

    const result = await getMyGroupsAction();

    expect(result).toEqual({
      ok: false,
      error: 'unauthorized',
      message: '로그인이 필요합니다.',
    });
  });

  it('조회 실패 시 server-error를 반환한다', async () => {
    const query = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({
        data: null,
        error: { message: 'db failed' },
      }),
    };
    const supabase = {
      from: jest.fn().mockReturnValue(query),
    };

    mockRequireUser.mockResolvedValue({
      ok: true,
      supabase,
      user: { id: userId },
    });

    const result = await getMyGroupsAction();

    expect(result).toEqual({
      ok: false,
      error: 'server-error',
      message: '그룹 정보를 불러올 수 없습니다.',
    });
  });

  it('그룹 목록을 매핑해 반환한다', async () => {
    const query = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({
        data: [
          {
            group_id: '20000000-0000-4000-8000-000000000101',
            groups: { name: '점심팟' },
          },
          {
            group_id: '20000000-0000-4000-8000-000000000102',
            groups: null,
          },
        ],
        error: null,
      }),
    };
    const supabase = {
      from: jest.fn().mockReturnValue(query),
    };

    mockRequireUser.mockResolvedValue({
      ok: true,
      supabase,
      user: { id: userId },
    });

    const result = await getMyGroupsAction();

    expect(supabase.from).toHaveBeenCalledWith('group_members');
    expect(query.select).toHaveBeenCalledWith('group_id, groups(name)');
    expect(query.eq).toHaveBeenCalledWith('user_id', userId);
    expect(query.order).toHaveBeenCalledWith('joined_at', { ascending: false });
    expect(result).toEqual({
      ok: true,
      data: {
        groups: [
          { groupId: '20000000-0000-4000-8000-000000000101', name: '점심팟' },
          { groupId: '20000000-0000-4000-8000-000000000102', name: '알 수 없음' },
        ],
      },
    });
  });
});
