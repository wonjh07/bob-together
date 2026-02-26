import { createSupabaseServerClient } from '@/libs/supabase/server';

import { getGroupMembersAction } from './getGroupMembersAction';

jest.mock('@/libs/supabase/server');

describe('getGroupMembersAction', () => {
  const rpc = jest.fn();
  const mockSupabaseClient = {
    auth: {
      getUser: jest.fn(),
    },
    rpc,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    (createSupabaseServerClient as jest.Mock).mockReturnValue(mockSupabaseClient);
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: {
        user: {
          id: '550e8400-e29b-41d4-a716-446655440123',
        },
      },
      error: null,
    });
    rpc.mockResolvedValue({
      data: [
        {
          ok: true,
          error_code: null,
          member_count: 1,
          members: [
            {
              user_id: '550e8400-e29b-41d4-a716-446655440123',
              role: 'owner',
              name: '홍길동',
              nickname: '길동',
              profile_image: null,
            },
          ],
        },
      ],
      error: null,
    });
  });

  it('groupId가 비어 있으면 invalid-format을 반환한다', async () => {
    const result = await getGroupMembersAction('');

    expect(result).toEqual({
      ok: false,
      error: 'invalid-format',
      message: '그룹 정보가 필요합니다.',
    });
  });

  it('groupId 형식이 올바르지 않으면 invalid-format을 반환한다', async () => {
    const result = await getGroupMembersAction('invalid-group-id');

    expect(result).toEqual({
      ok: false,
      error: 'invalid-format',
      message: '유효한 그룹 ID가 아닙니다.',
    });
  });

  it('RPC 호출이 성공하면 멤버 목록을 반환한다', async () => {
    const groupId = '550e8400-e29b-41d4-a716-446655440000';
    const result = await getGroupMembersAction(groupId);

    expect(rpc).toHaveBeenCalledWith('get_group_members_with_count', {
      p_user_id: '550e8400-e29b-41d4-a716-446655440123',
      p_group_id: groupId,
    });
    expect(result).toEqual({
      ok: true,
      data: {
        memberCount: 1,
        members: [
          {
            userId: '550e8400-e29b-41d4-a716-446655440123',
            role: 'owner',
            name: '홍길동',
            nickname: '길동',
            profileImage: null,
          },
        ],
        currentUserId: '550e8400-e29b-41d4-a716-446655440123',
      },
    });
  });

  it('RPC가 invalid-format을 반환하면 invalid-format을 반환한다', async () => {
    rpc.mockResolvedValue({
      data: [{
        ok: false,
        error_code: 'invalid-format',
        member_count: 0,
        members: [],
      }],
      error: null,
    });

    const result = await getGroupMembersAction('550e8400-e29b-41d4-a716-446655440000');

    expect(result).toEqual({
      ok: false,
      error: 'invalid-format',
      message: '그룹 정보가 필요합니다.',
    });
  });
});
