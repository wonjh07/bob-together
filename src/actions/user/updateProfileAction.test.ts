import { createSupabaseServerClient } from '@/libs/supabase/server';

import { updateProfileAction } from './updateProfileAction';

jest.mock('@/libs/supabase/server');

describe('updateProfileAction', () => {
  const updateMaybeSingle = jest.fn();
  const usersUpdateSelectChain = {
    maybeSingle: updateMaybeSingle,
  };
  const usersUpdateEqChain = {
    select: jest.fn(() => usersUpdateSelectChain),
  };
  const usersUpdateChain = {
    eq: jest.fn(() => usersUpdateEqChain),
  };
  const usersTable = {
    update: jest.fn(() => usersUpdateChain),
  };

  const mockSupabaseClient = {
    auth: {
      getUser: jest.fn(),
      updateUser: jest.fn(),
    },
    from: jest.fn((table: string) => {
      if (table === 'users') {
        return usersTable;
      }
      throw new Error(`Unexpected table: ${table}`);
    }),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    (createSupabaseServerClient as jest.Mock).mockReturnValue(mockSupabaseClient);

    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: {
        user: {
          id: 'user-123',
          user_metadata: {
            foo: 'bar',
          },
        },
      },
      error: null,
    });
    updateMaybeSingle.mockResolvedValue({
      data: { user_id: 'user-123' },
      error: null,
    });
    mockSupabaseClient.auth.updateUser.mockResolvedValue({ error: null });
  });

  it('프로필 업데이트에 성공하면 ok:true를 반환해야 한다', async () => {
    const result = await updateProfileAction({
      name: '원재호',
      nickname: '째째왕자',
      password: 'Abcd1234!',
    });

    expect(result).toEqual({ ok: true });
    expect(usersTable.update).toHaveBeenCalledWith({
      name: '원재호',
      nickname: '째째왕자',
    });
    expect(mockSupabaseClient.auth.updateUser).toHaveBeenCalledWith({
      data: {
        foo: 'bar',
        name: '원재호',
        nickname: '째째왕자',
      },
      password: 'Abcd1234!',
    });
  });

  it('인증 사용자가 없으면 user-not-found를 반환해야 한다', async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null,
    });

    const result = await updateProfileAction({
      name: '원재호',
      nickname: '째째왕자',
    });

    expect(result).toEqual({
      ok: false,
      error: 'user-not-found',
      message: '로그인 정보를 확인할 수 없습니다.',
    });
  });

  it('users 업데이트 실패 시 update-failed를 반환해야 한다', async () => {
    updateMaybeSingle.mockResolvedValue({
      data: null,
      error: { message: 'permission denied' },
    });

    const result = await updateProfileAction({
      name: '원재호',
      nickname: '째째왕자',
    });

    expect(result).toEqual({
      ok: false,
      error: 'update-failed',
      message: '프로필 저장에 실패했습니다.',
    });
  });

  it('auth 메타데이터 업데이트 실패 시 update-failed를 반환해야 한다', async () => {
    mockSupabaseClient.auth.updateUser.mockResolvedValue({
      error: { message: 'auth update failed' },
    });

    const result = await updateProfileAction({
      name: '원재호',
      nickname: '째째왕자',
    });

    expect(result).toEqual({
      ok: false,
      error: 'update-failed',
      message: '계정 정보 업데이트에 실패했습니다.',
    });
  });
});
