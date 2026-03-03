import { createSupabaseAdminClient } from '@/libs/supabase/server';

import { verifyResetPasswordIdentityAction } from './verifyResetPasswordIdentityAction';

jest.mock('@/libs/supabase/server');

describe('verifyResetPasswordIdentityAction', () => {
  const mockLimit = jest.fn();
  const mockEq = jest.fn();
  const mockSelect = jest.fn();
  const mockFrom = jest.fn();

  const mockSupabaseClient = {
    from: mockFrom,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockFrom.mockReturnValue({ select: mockSelect });
    mockSelect.mockReturnValue({ eq: mockEq });
    mockEq.mockReturnValue({ eq: mockEq });

    (createSupabaseAdminClient as jest.Mock).mockReturnValue(
      mockSupabaseClient,
    );
  });

  it('일치 계정이 있으면 ok: true를 반환해야 한다', async () => {
    mockEq.mockImplementationOnce(() => ({ eq: mockEq }));
    mockEq.mockImplementationOnce(() => ({ limit: mockLimit }));
    mockLimit.mockResolvedValue({
      data: [{ user_id: 'user-1' }],
      error: null,
    });

    const result = await verifyResetPasswordIdentityAction(
      'test@example.com',
      '홍길동',
    );

    expect(result).toEqual({ ok: true });
    expect(mockFrom).toHaveBeenCalledWith('users');
  });

  it('일치 계정이 없으면 user-not-found를 반환해야 한다', async () => {
    mockEq.mockImplementationOnce(() => ({ eq: mockEq }));
    mockEq.mockImplementationOnce(() => ({ limit: mockLimit }));
    mockLimit.mockResolvedValue({
      data: [],
      error: null,
    });

    const result = await verifyResetPasswordIdentityAction(
      'test@example.com',
      '홍길동',
    );

    expect(result).toEqual({
      ok: false,
      error: 'user-not-found',
      message: '입력한 정보와 일치하는 계정을 찾을 수 없습니다.',
    });
  });

  it('유효하지 않은 입력은 invalid-format을 반환해야 한다', async () => {
    const result = await verifyResetPasswordIdentityAction('', '');

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe('invalid-format');
    }
    expect(mockFrom).not.toHaveBeenCalled();
  });
});
