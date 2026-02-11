import { createSupabaseServerClient } from '@/libs/supabase/server';

import { createQueryMock, mockUser, resetAllMocks } from './_testUtils';
import { sendGroupInvitationAction } from './sendGroupInvitationAction';

jest.mock('@/libs/supabase/server');

describe('sendGroupInvitationAction', () => {
  beforeEach(resetAllMocks);

  it('초대자가 멤버가 아니면 forbidden을 반환한다', async () => {
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

    const result = await sendGroupInvitationAction('group-1', 'user-2');

    expect(result).toEqual({
      ok: false,
      error: 'forbidden',
      message: '그룹 멤버만 초대할 수 있습니다.',
    });
  });
});
