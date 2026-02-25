import { createSupabaseServerClient } from '@/libs/supabase/server';

import { createQueryMock, mockUser, resetAllMocks } from './_testUtils';
import { searchGroupInvitableUsersAction } from './searchGroupInvitableUsersAction';

jest.mock('@/libs/supabase/server');

function createAwaitableQuery<T>(result: { data: T; error: null }) {
  const query = {
    select: jest.fn().mockReturnThis(),
    or: jest.fn().mockReturnThis(),
    neq: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    then: (
      onFulfilled: (value: { data: T; error: null }) => unknown,
      onRejected?: (reason: unknown) => unknown,
    ) => Promise.resolve(result).then(onFulfilled, onRejected),
  };

  return query;
}

describe('searchGroupInvitableUsersAction', () => {
  beforeEach(resetAllMocks);

  it('groupId가 없으면 invalid-format을 반환한다', async () => {
    const result = await searchGroupInvitableUsersAction('', '테스트');

    expect(result).toEqual({
      ok: false,
      error: 'invalid-format',
      message: '그룹 정보가 필요합니다.',
    });
  });

  it('검색어가 짧으면 invalid-format을 반환한다', async () => {
    const result = await searchGroupInvitableUsersAction('group-1', 'a');

    expect(result).toEqual({
      ok: false,
      error: 'invalid-format',
      message: '검색어를 2자 이상 입력해주세요.',
    });
  });

  it('초대자가 그룹 멤버가 아니면 forbidden을 반환한다', async () => {
    const membershipQuery = createQueryMock();
    membershipQuery.maybeSingle.mockResolvedValue({
      data: null,
      error: null,
    });

    const mockSupabaseClient = {
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }),
      },
      from: jest.fn().mockReturnValue(membershipQuery),
    };

    (createSupabaseServerClient as jest.Mock).mockReturnValue(
      mockSupabaseClient,
    );

    const result = await searchGroupInvitableUsersAction('group-1', '테스트');

    expect(result).toEqual({
      ok: false,
      error: 'forbidden',
      message: '그룹을 찾을 수 없거나 접근 권한이 없습니다.',
    });
  });

  it('이미 멤버는 제외하고 pending 초대 사용자는 결과에 포함한다', async () => {
    const membershipQuery = createQueryMock();
    membershipQuery.maybeSingle.mockResolvedValue({
      data: { group_id: 'group-1' },
      error: null,
    });

    const usersQuery = createAwaitableQuery({
      data: [
        { user_id: 'user-2', name: '멤버', nickname: 'member' },
        { user_id: 'user-3', name: '대기', nickname: 'pending' },
        { user_id: 'user-4', name: '가능', nickname: 'available' },
      ],
      error: null,
    });
    const membersQuery = createAwaitableQuery({
      data: [{ user_id: 'user-2' }],
      error: null,
    });
    const pendingQuery = createAwaitableQuery({
      data: [{ invitee_id: 'user-3' }],
      error: null,
    });

    let groupMembersCallCount = 0;
    const mockSupabaseClient = {
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }),
      },
      from: jest.fn((table: string) => {
        if (table === 'group_members') {
          groupMembersCallCount += 1;
          return groupMembersCallCount === 1 ? membershipQuery : membersQuery;
        }
        if (table === 'users') {
          return usersQuery;
        }
        if (table === 'invitations') {
          return pendingQuery;
        }
        throw new Error(`unexpected table: ${table}`);
      }),
    };

    (createSupabaseServerClient as jest.Mock).mockReturnValue(
      mockSupabaseClient,
    );

    const result = await searchGroupInvitableUsersAction('group-1', '사용');

    expect(result).toEqual({
      ok: true,
      data: {
        users: [
          { userId: 'user-3', name: '대기', nickname: 'pending' },
          { userId: 'user-4', name: '가능', nickname: 'available' },
        ],
        pendingInviteeIds: ['user-3'],
      },
    });
  });
});
