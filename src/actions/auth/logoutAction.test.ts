import { createSupabaseServerClient } from '@/libs/supabase/server';

import { logoutAction } from './logoutAction';

jest.mock('@/libs/supabase/server');

describe('logoutAction', () => {
  const mockSupabaseClient = {
    auth: {
      signOut: jest.fn(),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    (createSupabaseServerClient as jest.Mock).mockReturnValue(
      mockSupabaseClient,
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('로그아웃 성공 시 redirect를 던져야 한다', async () => {
    mockSupabaseClient.auth.signOut.mockResolvedValue({
      error: null,
    });

    await expect(logoutAction()).rejects.toThrow('REDIRECT: /login');
    expect(mockSupabaseClient.auth.signOut).toHaveBeenCalled();
  });

  it('로그아웃 실패 시 logout-failed 에러를 반환해야 한다', async () => {
    mockSupabaseClient.auth.signOut.mockResolvedValue({
      error: { message: 'Failed to sign out' },
    });

    const result = await logoutAction();

    expect(result).toEqual({
      ok: false,
      error: 'logout-failed',
      message: 'Failed to sign out',
    });
  });
});
