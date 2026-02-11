import { createSupabaseServerClient } from '@/libs/supabase/server';

import { createQueryMock, mockUser, resetAllMocks } from './_testUtils';
import { joinGroupAction } from './joinGroupAction';

jest.mock('@/libs/supabase/server');

describe('joinGroupAction', () => {
  beforeEach(resetAllMocks);

  it('이미 가입된 경우 ok를 반환한다', async () => {
    const groupQuery = createQueryMock();
    groupQuery.maybeSingle.mockResolvedValue({
      data: { group_id: 'group-1' },
      error: null,
    });

    const memberCheckQuery = createQueryMock();
    memberCheckQuery.maybeSingle.mockResolvedValue({
      data: { group_id: 'group-1' },
      error: null,
    });

    const mockSupabaseClient = {
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }),
      },
      from: jest
        .fn()
        .mockImplementationOnce(() => groupQuery)
        .mockImplementationOnce(() => memberCheckQuery),
    };

    (createSupabaseServerClient as jest.Mock).mockReturnValue(
      mockSupabaseClient,
    );

    const result = await joinGroupAction('group-1');

    expect(result).toEqual({ ok: true, data: { groupId: 'group-1' } });
  });
});
