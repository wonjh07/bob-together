import { createSupabaseServerClient } from '@/libs/supabase/server';

import { mockUser, resetAllMocks } from './_testUtils';
import { createGroupAction } from './createGroupAction';

jest.mock('@/libs/supabase/server');

describe('createGroupAction', () => {
  beforeEach(resetAllMocks);

  it('로그인이 없으면 unauthorized를 반환한다', async () => {
    const mockSupabaseClient = {
      auth: { getUser: jest.fn().mockResolvedValue({ data: {}, error: null }) },
      rpc: jest.fn(),
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
    const rpc = jest.fn().mockResolvedValue({
      data: [
        {
          ok: true,
          error_code: null,
          group_id: 'group-1',
          group_name: '테스트그룹',
        },
      ],
      error: null,
    });

    const mockSupabaseClient = {
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }),
      },
      rpc,
    };

    (createSupabaseServerClient as jest.Mock).mockReturnValue(
      mockSupabaseClient,
    );

    const result = await createGroupAction('테스트그룹');

    expect(result).toEqual({
      ok: true,
      data: { groupId: 'group-1', name: '테스트그룹' },
    });
    expect(rpc).toHaveBeenCalledWith(
      'create_group_transactional',
      expect.objectContaining({
        p_owner_id: mockUser.id,
        p_group_name: '테스트그룹',
      }),
    );
  });
});
