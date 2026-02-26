import { createSupabaseServerClient } from '@/libs/supabase/server';

import { mockUser, resetAllMocks } from './_testUtils';
import { searchGroupInvitableUsersAction } from './searchGroupInvitableUsersAction';

jest.mock('@/libs/supabase/server');

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
    const rpc = jest.fn().mockResolvedValue({
      data: [
        {
          ok: false,
          error_code: 'forbidden',
          users: [],
          pending_invitee_ids: [],
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

    const result = await searchGroupInvitableUsersAction('group-1', '테스트');

    expect(result).toEqual({
      ok: false,
      error: 'forbidden',
      message: '그룹을 찾을 수 없거나 접근 권한이 없습니다.',
    });
  });

  it('이미 멤버는 제외하고 pending 초대 사용자는 결과에 포함한다', async () => {
    const rpc = jest.fn().mockResolvedValue({
      data: [
        {
          ok: true,
          error_code: null,
          users: [
            { user_id: 'user-3', name: '대기', nickname: 'pending' },
            { user_id: 'user-4', name: '가능', nickname: 'available' },
          ],
          pending_invitee_ids: ['user-3'],
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

    const result = await searchGroupInvitableUsersAction('group-1', '사용');

    expect(rpc).toHaveBeenCalledWith(
      'search_group_invitable_users_transactional',
      expect.objectContaining({
        p_inviter_id: mockUser.id,
        p_group_id: 'group-1',
        p_query: '사용',
        p_limit: 6,
        p_candidate_limit: 20,
      }),
    );

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
