import { createSupabaseServerClient } from '@/libs/supabase/server';

import { createQueryMock, mockUser, resetAllMocks } from './_testUtils';
import { createGroupAction } from './createGroupAction';

jest.mock('@/libs/supabase/server');

describe('createGroupAction', () => {
  beforeEach(resetAllMocks);

  it('로그인이 없으면 unauthorized를 반환한다', async () => {
    const mockSupabaseClient = {
      auth: { getUser: jest.fn().mockResolvedValue({ data: {}, error: null }) },
      from: jest.fn(),
    };

    (createSupabaseServerClient as jest.Mock).mockReturnValue(
      mockSupabaseClient,
    );

    const result = await createGroupAction('테스트그룹');

    expect(result).toEqual({
      ok: false,
      error: 'unauthorized',
      message: '로그인이 필요합니다.',
    });
  });

  it('그룹을 생성하고 소유자를 멤버로 추가한다', async () => {
    const checkQuery = createQueryMock();
    checkQuery.limit.mockResolvedValue({ data: [], error: null });

    const insertQuery = createQueryMock();
    insertQuery.single.mockResolvedValue({
      data: { group_id: 'group-1', name: '테스트그룹' },
      error: null,
    });

    const memberQuery = {
      insert: jest.fn().mockResolvedValue({ error: null }),
    };

    const mockSupabaseClient = {
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }),
      },
      from: jest
        .fn()
        .mockImplementationOnce(() => checkQuery)
        .mockImplementationOnce(() => insertQuery)
        .mockImplementationOnce(() => memberQuery),
    };

    (createSupabaseServerClient as jest.Mock).mockReturnValue(
      mockSupabaseClient,
    );

    const result = await createGroupAction('테스트그룹');

    expect(result).toEqual({
      ok: true,
      data: { groupId: 'group-1', name: '테스트그룹' },
    });
  });
});
