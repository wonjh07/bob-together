import { createSupabaseServerClient } from '@/libs/supabase/server';

import { createQueryMock, mockUser, resetAllMocks } from './_testUtils';
import { leaveGroupAction } from './leaveGroupAction';

jest.mock('@/libs/supabase/server');

describe('leaveGroupAction', () => {
  beforeEach(resetAllMocks);

  it('owner인 경우 forbidden을 반환한다', async () => {
    const memberQuery = createQueryMock();
    memberQuery.maybeSingle.mockResolvedValue({
      data: { role: 'owner' },
      error: null,
    });

    const mockSupabaseClient = {
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }),
      },
      from: jest.fn().mockReturnValue(memberQuery),
    };

    (createSupabaseServerClient as jest.Mock).mockReturnValue(mockSupabaseClient);

    const result = await leaveGroupAction('group-1');

    expect(result).toEqual({
      ok: false,
      error: 'forbidden',
      message: '그룹장은 그룹을 탈퇴할 수 없습니다.',
    });
  });

  it('member인 경우 group_members에서 삭제한다', async () => {
    const memberQuery = createQueryMock();
    memberQuery.maybeSingle.mockResolvedValue({
      data: { role: 'member' },
      error: null,
    });
    memberQuery.eq.mockReturnThis();
    memberQuery.delete.mockReturnThis();

    const mockSupabaseClient = {
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }),
      },
      from: jest.fn().mockReturnValue(memberQuery),
    };

    (createSupabaseServerClient as jest.Mock).mockReturnValue(mockSupabaseClient);

    const result = await leaveGroupAction('group-1');

    expect(result).toEqual({
      ok: true,
      data: { groupId: 'group-1' },
    });
    expect(memberQuery.delete).toHaveBeenCalledTimes(1);
  });
});
