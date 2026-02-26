import { createSupabaseServerClient } from '@/libs/supabase/server';

import { mockUser, resetAllMocks } from './_testUtils';
import { sendGroupInvitationAction } from './sendGroupInvitationAction';

jest.mock('@/libs/supabase/server');

describe('sendGroupInvitationAction', () => {
  beforeEach(resetAllMocks);

  it('초대자가 멤버가 아니면 forbidden을 반환한다', async () => {
    const rpc = jest.fn().mockResolvedValue({
      data: [{ ok: false, error_code: 'forbidden' }],
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

    const result = await sendGroupInvitationAction('group-1', 'user-2');

    expect(result).toEqual({
      ok: false,
      error: 'forbidden',
      message: '그룹 멤버만 초대할 수 있습니다.',
    });
    expect(rpc).toHaveBeenCalledWith(
      'send_group_invitation_transactional',
      expect.objectContaining({
        p_inviter_id: mockUser.id,
        p_group_id: 'group-1',
        p_invitee_id: 'user-2',
      }),
    );
  });
});
