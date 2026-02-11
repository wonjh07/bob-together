import { createSupabaseServerClient } from '@/libs/supabase/server';

import { signupAction } from './signupAction';

jest.mock('@/libs/supabase/server');

describe('signupAction', () => {
  const mockSupabaseClient = {
    auth: {
      signUp: jest.fn(),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (createSupabaseServerClient as jest.Mock).mockReturnValue(
      mockSupabaseClient,
    );
  });

  it('유효한 데이터로 회원가입 성공 시 ok: true를 반환해야 한다', async () => {
    mockSupabaseClient.auth.signUp.mockResolvedValue({
      data: { user: { id: '123' } },
      error: null,
    });

    const params = {
      email: 'test@example.com',
      password: 'Password123!',
      name: '홍길동',
      nickname: 'gildong',
    };

    const result = await signupAction(params);

    expect(result).toEqual({ ok: true });
    expect(mockSupabaseClient.auth.signUp).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'Password123!',
      options: {
        data: {
          name: '홍길동',
          nickname: 'gildong',
        },
      },
    });
  });

  it('Supabase 에러 발생 시 에러를 반환해야 한다', async () => {
    mockSupabaseClient.auth.signUp.mockResolvedValue({
      data: null,
      error: { message: 'User already exists' },
    });

    const params = {
      email: 'existing@example.com',
      password: 'Password123!',
      name: '홍길동',
      nickname: 'gildong',
    };

    const result = await signupAction(params);

    expect(result).toEqual({
      ok: false,
      error: 'signup-failed',
      message: 'User already exists',
    });
  });

  it('잘못된 이메일 형식은 validation 에러를 반환해야 한다', async () => {
    const params = {
      email: 'invalid-email',
      password: 'Password123!',
      name: '홍길동',
      nickname: 'gildong',
    };

    const result = await signupAction(params);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe('invalid-format');
    }
    expect(mockSupabaseClient.auth.signUp).not.toHaveBeenCalled();
  });

  it('짧은 비밀번호는 validation 에러를 반환해야 한다', async () => {
    const params = {
      email: 'test@example.com',
      password: 'Pass1!',
      name: '홍길동',
      nickname: 'gildong',
    };

    const result = await signupAction(params);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe('invalid-format');
    }
    expect(mockSupabaseClient.auth.signUp).not.toHaveBeenCalled();
  });

  it('빈 이름은 validation 에러를 반환해야 한다', async () => {
    const params = {
      email: 'test@example.com',
      password: 'Password123!',
      name: '',
      nickname: 'gildong',
    };

    const result = await signupAction(params);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe('invalid-format');
    }
  });

  it('예외 발생 시 server-error를 반환해야 한다', async () => {
    mockSupabaseClient.auth.signUp.mockRejectedValue(new Error('Network error'));

    const params = {
      email: 'test@example.com',
      password: 'Password123!',
      name: '홍길동',
      nickname: 'gildong',
    };

    const result = await signupAction(params);

    expect(result).toEqual({
      ok: false,
      error: 'server-error',
      message: 'Network error',
    });
  });
});
