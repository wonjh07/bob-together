import { createSupabaseAdminClient } from '@/libs/supabase/server';

import { resetPasswordByIdentityAction } from './resetPasswordByIdentityAction';

jest.mock('@/libs/supabase/server');

describe('resetPasswordByIdentityAction', () => {
  const mockLimit = jest.fn();
  const mockEq = jest.fn();
  const mockSelect = jest.fn();
  const mockFrom = jest.fn();
  const mockUpdateUserById = jest.fn();

  const mockSupabaseClient = {
    from: mockFrom,
    auth: {
      admin: {
        updateUserById: mockUpdateUserById,
      },
    },
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

  it('입력이 유효하고 계정이 있으면 비밀번호 재설정에 성공해야 한다', async () => {
    mockEq.mockImplementationOnce(() => ({ eq: mockEq }));
    mockEq.mockImplementationOnce(() => ({ limit: mockLimit }));
    mockLimit.mockResolvedValue({
      data: [{ user_id: 'user-1' }],
      error: null,
    });
    mockUpdateUserById.mockResolvedValue({
      data: {},
      error: null,
    });

    const result = await resetPasswordByIdentityAction({
      email: 'test@example.com',
      name: '홍길동',
      newPassword: 'Password123!',
      passwordConfirm: 'Password123!',
    });

    expect(result).toEqual({ ok: true });
    expect(mockUpdateUserById).toHaveBeenCalledWith('user-1', {
      password: 'Password123!',
    });
  });

  it('일치 계정이 없으면 user-not-found를 반환해야 한다', async () => {
    mockEq.mockImplementationOnce(() => ({ eq: mockEq }));
    mockEq.mockImplementationOnce(() => ({ limit: mockLimit }));
    mockLimit.mockResolvedValue({
      data: [],
      error: null,
    });

    const result = await resetPasswordByIdentityAction({
      email: 'test@example.com',
      name: '홍길동',
      newPassword: 'Password123!',
      passwordConfirm: 'Password123!',
    });

    expect(result).toEqual({
      ok: false,
      error: 'user-not-found',
      message: '입력한 정보와 일치하는 계정을 찾을 수 없습니다.',
    });
    expect(mockUpdateUserById).not.toHaveBeenCalled();
  });

  it('새 비밀번호 검증 실패 시 invalid-format을 반환해야 한다', async () => {
    const result = await resetPasswordByIdentityAction({
      email: 'test@example.com',
      name: '홍길동',
      newPassword: 'short',
      passwordConfirm: 'short',
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe('invalid-format');
    }
    expect(mockFrom).not.toHaveBeenCalled();
  });
});
