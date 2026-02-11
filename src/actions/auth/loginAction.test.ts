import { createSupabaseServerClient } from '@/libs/supabase/server';

import { loginAction } from './loginAction';

jest.mock('@/libs/supabase/server');

describe('loginAction', () => {
  const mockSupabaseClient = {
    auth: {
      signInWithPassword: jest.fn(),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (createSupabaseServerClient as jest.Mock).mockReturnValue(
      mockSupabaseClient,
    );
  });

  it('유효한 자격 증명으로 로그인 성공 시 ok: true를 반환해야 한다', async () => {
    mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
      data: { user: { id: '123' } },
      error: null,
    });

    const result = await loginAction('test@example.com', 'Password123!');

    expect(result).toEqual({ ok: true });
    expect(mockSupabaseClient.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'Password123!',
    });
  });

  it('잘못된 자격 증명은 invalid-credentials 에러를 반환해야 한다', async () => {
    mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
      data: null,
      error: { message: 'Invalid login credentials', status: 400 },
    });

    const result = await loginAction('test@example.com', 'WrongPassword');

    expect(result).toEqual({
      ok: false,
      error: 'invalid-credentials',
      message: '이메일 또는 비밀번호가 올바르지 않습니다.',
    });
  });

  it('빈 이메일은 invalid-email 에러를 반환해야 한다', async () => {
    const result = await loginAction('', 'Password123!');

    expect(result).toEqual({
      ok: false,
      error: 'invalid-email',
      message: '이메일을 입력해주세요.',
    });
    expect(mockSupabaseClient.auth.signInWithPassword).not.toHaveBeenCalled();
  });

  it('빈 비밀번호는 invalid-email 에러를 반환해야 한다', async () => {
    const result = await loginAction('test@example.com', '');

    expect(result).toEqual({
      ok: false,
      error: 'invalid-email',
      message: '비밀번호를 입력해주세요.',
    });
    expect(mockSupabaseClient.auth.signInWithPassword).not.toHaveBeenCalled();
  });

  it('잘못된 이메일 형식은 invalid-email 에러를 반환해야 한다', async () => {
    const result = await loginAction('invalid-email', 'Password123!');

    expect(result).toEqual({
      ok: false,
      error: 'invalid-email',
      message: '올바른 이메일 형식이 아닙니다.',
    });
    expect(mockSupabaseClient.auth.signInWithPassword).not.toHaveBeenCalled();
  });

  it('일반적인 로그인 실패는 login-failed 에러를 반환해야 한다', async () => {
    mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
      data: null,
      error: { message: 'Some other error', status: 500 },
    });

    const result = await loginAction('test@example.com', 'Password123!');

    expect(result).toEqual({
      ok: false,
      error: 'login-failed',
      message: '로그인 중 오류가 발생했습니다.',
    });
  });

  it('이메일을 정규화(소문자, trim)하여 로그인해야 한다', async () => {
    mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
      data: { user: { id: '123' } },
      error: null,
    });

    const result = await loginAction('  Test@Example.COM  ', 'Password123!');

    expect(result).toEqual({ ok: true });
    expect(mockSupabaseClient.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'Password123!',
    });
  });
});
