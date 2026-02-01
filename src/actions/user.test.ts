import { createSupabaseServerClient } from '@/libs/supabase/server';

import { getUserData } from './user';

// Mock
jest.mock('@/libs/supabase/server');

describe('getUserData', () => {
  const mockSupabaseClient = {
    auth: {
      getUser: jest.fn(),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (createSupabaseServerClient as jest.Mock).mockReturnValue(
      mockSupabaseClient,
    );
  });

  it('인증된 사용자 정보를 성공적으로 반환해야 한다', async () => {
    // Arrange
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: {
        user: {
          id: '123',
          email: 'test@example.com',
          user_metadata: {
            name: '홍길동',
            nickname: 'gildong',
          },
        },
      },
      error: null,
    });

    // Act
    const result = await getUserData();

    // Assert
    expect(result).toEqual({
      ok: true,
      data: {
        id: '123',
        email: 'test@example.com',
        name: '홍길동',
        nickname: 'gildong',
      },
    });
  });

  it('인증되지 않은 사용자는 user-not-found 에러를 반환해야 한다', async () => {
    // Arrange
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null,
    });

    // Act
    const result = await getUserData();

    // Assert
    expect(result).toEqual({
      ok: false,
      error: 'user-not-found',
      message: '사용자 정보를 불러올 수 없습니다.',
    });
  });

  it('Supabase 에러 발생 시 에러를 반환해야 한다', async () => {
    // Arrange
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'Auth session missing' },
    });

    // Act
    const result = await getUserData();

    // Assert
    expect(result).toEqual({
      ok: false,
      error: 'user-not-found',
      message: 'Auth session missing',
    });
  });

  it('예외 발생 시 server-error를 반환해야 한다', async () => {
    // Arrange
    mockSupabaseClient.auth.getUser.mockRejectedValue(
      new Error('Network error'),
    );

    // Act
    const result = await getUserData();

    // Assert
    expect(result).toEqual({
      ok: false,
      error: 'server-error',
      message: 'Network error',
    });
  });
});
