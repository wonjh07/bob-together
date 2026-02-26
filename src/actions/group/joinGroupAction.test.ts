import { createSupabaseServerClient } from '@/libs/supabase/server';

import { mockUser, resetAllMocks } from './_testUtils';
import { joinGroupAction } from './joinGroupAction';

jest.mock('@/libs/supabase/server');

describe('joinGroupAction', () => {
  beforeEach(resetAllMocks);

  it('이미 가입된 경우 ok를 반환한다', async () => {
    const rpc = jest.fn().mockResolvedValue({
      data: [{ ok: true, error_code: null, group_id: 'group-1' }],
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

    const result = await joinGroupAction('group-1');

    expect(result).toEqual({ ok: true, data: { groupId: 'group-1' } });
    expect(rpc).toHaveBeenCalledWith(
      'join_group_transactional',
      expect.objectContaining({
        p_user_id: mockUser.id,
        p_group_id: 'group-1',
      }),
    );
  });
});
