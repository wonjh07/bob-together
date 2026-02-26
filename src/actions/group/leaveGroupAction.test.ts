import { createSupabaseServerClient } from '@/libs/supabase/server';

import { mockUser, resetAllMocks } from './_testUtils';
import { leaveGroupAction } from './leaveGroupAction';

jest.mock('@/libs/supabase/server');

describe('leaveGroupAction', () => {
  const GROUP_ID = '550e8400-e29b-41d4-a716-446655440000';

  beforeEach(resetAllMocks);

  it('owner인 경우 forbidden을 반환한다', async () => {
    const rpc = jest.fn().mockResolvedValue({
      data: [
        {
          ok: false,
          error_code: 'forbidden-owner',
          group_id: null,
        },
      ],
      error: null,
    });

    const mockSupabaseClient = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: mockUser },
          error: null,
        }),
      },
      rpc,
    };

    (createSupabaseServerClient as jest.Mock).mockReturnValue(mockSupabaseClient);

    const result = await leaveGroupAction(GROUP_ID);

    expect(result).toEqual({
      ok: false,
      error: 'forbidden',
      message: '그룹장은 그룹을 탈퇴할 수 없습니다.',
    });
  });

  it('member인 경우 group_members에서 삭제한다', async () => {
    const rpc = jest.fn().mockResolvedValue({
      data: [
        {
          ok: true,
          error_code: null,
          group_id: GROUP_ID,
        },
      ],
      error: null,
    });

    const mockSupabaseClient = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: mockUser },
          error: null,
        }),
      },
      rpc,
    };

    (createSupabaseServerClient as jest.Mock).mockReturnValue(mockSupabaseClient);

    const result = await leaveGroupAction(GROUP_ID);

    expect(result).toEqual({
      ok: true,
      data: { groupId: GROUP_ID },
    });
    expect(rpc).toHaveBeenCalledWith('leave_group_transactional', {
      p_user_id: mockUser.id,
      p_group_id: GROUP_ID,
    });
  });
});
