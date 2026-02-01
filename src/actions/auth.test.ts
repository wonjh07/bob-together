import { createSupabaseServerClient } from '@/libs/supabase/server';

import { loginAction, signupAction, logoutAction } from './auth';

// Mock
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
    // Arrange
    mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
      data: { user: { id: '123' } },
      error: null,
    });

    // Act
    const result = await loginAction('test@example.com', 'Password123!');

    // Assert
    expect(result).toEqual({ ok: true });
    expect(mockSupabaseClient.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'Password123!',
    });
  });

  it('잘못된 자격 증명은 invalid-credentials 에러를 반환해야 한다', async () => {
    // Arrange
    mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
      data: null,
      error: { message: 'Invalid login credentials', status: 400 },
    });

    // Act
    const result = await loginAction('test@example.com', 'WrongPassword');

    // Assert
    expect(result).toEqual({
      ok: false,
      error: 'invalid-credentials',
      message: '이메일 또는 비밀번호가 올바르지 않습니다.',
    });
  });

  it('빈 이메일은 invalid-email 에러를 반환해야 한다', async () => {
    // Act
    const result = await loginAction('', 'Password123!');

    // Assert
    expect(result).toEqual({
      ok: false,
      error: 'invalid-email',
      message: '이메일을 입력해주세요.',
    });
    expect(mockSupabaseClient.auth.signInWithPassword).not.toHaveBeenCalled();
  });

  it('빈 비밀번호는 invalid-email 에러를 반환해야 한다', async () => {
    // Act
    const result = await loginAction('test@example.com', '');

    // Assert
    expect(result).toEqual({
      ok: false,
      error: 'invalid-email',
      message: '비밀번호를 입력해주세요.',
    });
    expect(mockSupabaseClient.auth.signInWithPassword).not.toHaveBeenCalled();
  });

  it('잘못된 이메일 형식은 invalid-email 에러를 반환해야 한다', async () => {
    // Act
    const result = await loginAction('invalid-email', 'Password123!');

    // Assert
    expect(result).toEqual({
      ok: false,
      error: 'invalid-email',
      message: '올바른 이메일 형식이 아닙니다.',
    });
    expect(mockSupabaseClient.auth.signInWithPassword).not.toHaveBeenCalled();
  });

  it('일반적인 로그인 실패는 login-failed 에러를 반환해야 한다', async () => {
    // Arrange
    mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
      data: null,
      error: { message: 'Some other error', status: 500 },
    });

    // Act
    const result = await loginAction('test@example.com', 'Password123!');

    // Assert
    expect(result).toEqual({
      ok: false,
      error: 'login-failed',
      message: '로그인 중 오류가 발생했습니다.',
    });
  });

  it('이메일을 정규화(소문자, trim)하여 로그인해야 한다', async () => {
    // Arrange
    mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
      data: { user: { id: '123' } },
      error: null,
    });

    // Act
    const result = await loginAction('  Test@Example.COM  ', 'Password123!');

    // Assert
    expect(result).toEqual({ ok: true });
    expect(mockSupabaseClient.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'Password123!',
    });
  });
});

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

  it('유효한 데이터로 회원가입 성공 시 redirect를 던져야 한다', async () => {
    // Arrange
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

    // Act & Assert
    await expect(signupAction(params)).rejects.toThrow(
      'REDIRECT: /signup/success',
    );

    // 올바른 파라미터로 호출되었는지 확인
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
    // Arrange
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

    // Act
    const result = await signupAction(params);

    // Assert
    expect(result).toEqual({
      ok: false,
      error: 'signup-failed',
      message: 'User already exists',
    });
  });

  it('잘못된 이메일 형식은 validation 에러를 반환해야 한다', async () => {
    // Arrange
    const params = {
      email: 'invalid-email',
      password: 'Password123!',
      name: '홍길동',
      nickname: 'gildong',
    };

    // Act
    const result = await signupAction(params);

    // Assert
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe('invalid-format');
    }
    expect(mockSupabaseClient.auth.signUp).not.toHaveBeenCalled();
  });

  it('짧은 비밀번호는 validation 에러를 반환해야 한다', async () => {
    // Arrange
    const params = {
      email: 'test@example.com',
      password: 'Pass1!',
      name: '홍길동',
      nickname: 'gildong',
    };

    // Act
    const result = await signupAction(params);

    // Assert
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe('invalid-format');
    }
    expect(mockSupabaseClient.auth.signUp).not.toHaveBeenCalled();
  });

  it('빈 이름은 validation 에러를 반환해야 한다', async () => {
    // Arrange
    const params = {
      email: 'test@example.com',
      password: 'Password123!',
      name: '',
      nickname: 'gildong',
    };

    // Act
    const result = await signupAction(params);

    // Assert
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe('invalid-format');
    }
  });

  it('예외 발생 시 server-error를 반환해야 한다', async () => {
    // Arrange
    mockSupabaseClient.auth.signUp.mockRejectedValue(
      new Error('Network error'),
    );

    const params = {
      email: 'test@example.com',
      password: 'Password123!',
      name: '홍길동',
      nickname: 'gildong',
    };

    // Act
    const result = await signupAction(params);

    // Assert
    expect(result).toEqual({
      ok: false,
      error: 'server-error',
      message: 'Network error',
    });
  });
});

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
    // Arrange
    mockSupabaseClient.auth.signOut.mockResolvedValue({
      error: null,
    });

    // Act & Assert
    await expect(logoutAction()).rejects.toThrow('REDIRECT: /login');

    expect(mockSupabaseClient.auth.signOut).toHaveBeenCalled();
  });

  it('로그아웃 실패 시 logout-failed 에러를 반환해야 한다', async () => {
    // Arrange
    mockSupabaseClient.auth.signOut.mockResolvedValue({
      error: { message: 'Failed to sign out' },
    });

    // Act
    const result = await logoutAction();

    // Assert
    expect(result).toEqual({
      ok: false,
      error: 'logout-failed',
      message: 'Failed to sign out',
    });
  });
});
