import { createSupabaseAdminClient } from '@/libs/supabase/server';

import { checkEmailExists } from './validation';

// Mock Supabase
jest.mock('@/libs/supabase/server');

describe('checkEmailExists', () => {
  const mockFromChain = {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    maybeSingle: jest.fn(),
  };

  const mockAdminClient = {
    from: jest.fn(() => mockFromChain),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    (createSupabaseAdminClient as jest.Mock).mockReturnValue(mockAdminClient);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('존재하는 이메일은 exists: true를 반환해야 한다', async () => {
    // Arrange
    mockFromChain.maybeSingle.mockResolvedValue({
      data: { id: '123' },
      error: null,
    });

    // Act
    const result = await checkEmailExists('existing@example.com');

    // Assert
    expect(result).toEqual({
      ok: true,
      data: { exists: true },
    });
    expect(mockFromChain.eq).toHaveBeenCalledWith(
      'email',
      'existing@example.com',
    );
  });

  it('존재하지 않는 이메일은 exists: false를 반환해야 한다', async () => {
    // Arrange
    mockFromChain.maybeSingle.mockResolvedValue({
      data: null,
      error: null,
    });

    // Act
    const result = await checkEmailExists('new@example.com');

    // Assert
    expect(result).toEqual({
      ok: true,
      data: { exists: false },
    });
  });

  it('빈 이메일은 invalid-format 에러를 반환해야 한다', async () => {
    // Act
    const result = await checkEmailExists('');

    // Assert
    expect(result).toEqual({
      ok: false,
      error: 'invalid-format',
      message: 'Invalid email format',
    });
    expect(mockAdminClient.from).not.toHaveBeenCalled();
  });

  it('잘못된 이메일 형식은 invalid-format 에러를 반환해야 한다', async () => {
    // Act
    const result = await checkEmailExists('invalid-email');

    // Assert
    expect(result).toEqual({
      ok: false,
      error: 'invalid-format',
      message: 'Invalid email format',
    });
    expect(mockAdminClient.from).not.toHaveBeenCalled();
  });

  it('DB 에러 발생 시 check-failed를 반환해야 한다', async () => {
    // Arrange
    mockFromChain.maybeSingle.mockResolvedValue({
      data: null,
      error: { message: 'Database connection failed' },
    });

    // Act
    const result = await checkEmailExists('test@example.com');

    // Assert
    expect(result).toEqual({
      ok: false,
      error: 'check-failed',
      message: 'Failed to check email',
    });
  });

  it('예외 발생 시 server-error를 반환해야 한다', async () => {
    // Arrange
    mockFromChain.maybeSingle.mockRejectedValue(new Error('Network error'));

    // Act
    const result = await checkEmailExists('test@example.com');

    // Assert
    expect(result).toEqual({
      ok: false,
      error: 'server-error',
      message: 'Server error occurred',
    });
  });

  it('이메일을 정규화(소문자, trim)하여 검색해야 한다', async () => {
    // Arrange
    mockFromChain.maybeSingle.mockResolvedValue({
      data: null,
      error: null,
    });

    // Act
    await checkEmailExists('  Test@Example.COM  ');

    // Assert
    expect(mockFromChain.eq).toHaveBeenCalledWith('email', 'test@example.com');
  });
});
