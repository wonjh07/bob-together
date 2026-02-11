import { createSupabaseServerClient } from '@/libs/supabase/server';

import { checkEmailExists } from './validation';

// Mock Supabase
jest.mock('@/libs/supabase/server');

describe('checkEmailExists', () => {
  const mockSupabaseClient = {
    rpc: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    (createSupabaseServerClient as jest.Mock).mockReturnValue(mockSupabaseClient);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('존재하는 이메일은 exists: true를 반환해야 한다', async () => {
    // Arrange
    mockSupabaseClient.rpc.mockResolvedValue({
      data: true,
      error: null,
    });

    // Act
    const result = await checkEmailExists('existing@example.com');

    // Assert
    expect(result).toEqual({
      ok: true,
      data: { exists: true },
    });
    expect(mockSupabaseClient.rpc).toHaveBeenCalledWith('check_email_exists', {
      p_email: 'existing@example.com',
    });
  });

  it('존재하지 않는 이메일은 exists: false를 반환해야 한다', async () => {
    // Arrange
    mockSupabaseClient.rpc.mockResolvedValue({
      data: false,
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
    expect(mockSupabaseClient.rpc).not.toHaveBeenCalled();
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
    expect(mockSupabaseClient.rpc).not.toHaveBeenCalled();
  });

  it('DB 에러 발생 시 check-failed를 반환해야 한다', async () => {
    // Arrange
    mockSupabaseClient.rpc.mockResolvedValue({
      data: false,
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
    mockSupabaseClient.rpc.mockRejectedValue(new Error('Network error'));

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
    mockSupabaseClient.rpc.mockResolvedValue({
      data: false,
      error: null,
    });

    // Act
    await checkEmailExists('  Test@Example.COM  ');

    // Assert
    expect(mockSupabaseClient.rpc).toHaveBeenCalledWith('check_email_exists', {
      p_email: 'test@example.com',
    });
  });
});
