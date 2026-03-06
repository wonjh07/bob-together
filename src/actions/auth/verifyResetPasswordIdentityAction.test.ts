import { createSupabaseAdminClient } from '@/libs/supabase/server';

import { verifyResetPasswordIdentityAction } from './verifyResetPasswordIdentityAction';

jest.mock('@/libs/supabase/server');

describe('verifyResetPasswordIdentityAction', () => {
  const mockRpc = jest.fn();

  const mockSupabaseClient = {
    rpc: mockRpc,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (createSupabaseAdminClient as jest.Mock).mockReturnValue(
      mockSupabaseClient,
    );
  });

  it('일치 계정이 있으면 ok: true를 반환해야 한다', async () => {
    mockRpc.mockResolvedValue({
      data: [{ user_id: 'user-1' }],
      error: null,
    });

    const result = await verifyResetPasswordIdentityAction(
      'test@example.com',
      '홍길동',
    );

    expect(result).toEqual(expect.objectContaining({ ok: true }));
    expect(mockRpc).toHaveBeenCalledWith('find_user_id_for_password_reset', {
      p_email: 'test@example.com',
      p_name: '홍길동',
    });
  });

  it('일치 계정이 없으면 user-not-found를 반환해야 한다', async () => {
    mockRpc.mockResolvedValue({
      data: [],
      error: null,
    });

    const result = await verifyResetPasswordIdentityAction(
      'test@example.com',
      '홍길동',
    );

    expect(result).toEqual(
      expect.objectContaining({
        ok: false,
        errorType: 'not_found',
        message: '입력한 정보와 일치하는 계정을 찾을 수 없습니다.',
      }),
    );
  });

  it('유효하지 않은 입력은 invalid-format을 반환해야 한다', async () => {
    const result = await verifyResetPasswordIdentityAction('', '');

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect('validation');
    }
    expect(mockRpc).not.toHaveBeenCalled();
  });
});
