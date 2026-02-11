import {
  createSupabaseServerClient,
} from '@/libs/supabase/server';

import { getUserData } from './getUserData';

jest.mock('@/libs/supabase/server');

describe('getUserData', () => {
  const mockSupabaseClient = {
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn((table: string) => {
      if (table === 'users') {
        return usersTable;
      }
      throw new Error(`Unexpected table: ${table}`);
    }),
  };
  const selectMaybeSingle = jest.fn();
  const usersSelectChain = {
    eq: jest.fn(() => ({
      maybeSingle: selectMaybeSingle,
    })),
  };
  const usersTable = {
    select: jest.fn(() => usersSelectChain),
  };
  beforeEach(() => {
    jest.clearAllMocks();

    (createSupabaseServerClient as jest.Mock).mockReturnValue(mockSupabaseClient);
    selectMaybeSingle.mockResolvedValue({ data: null, error: null });
  });

  it('users 테이블 정보를 우선 사용해 사용자 정보를 반환해야 한다', async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: {
        user: {
          id: '123',
          email: 'test@example.com',
          user_metadata: {
            name: '메타 이름',
            nickname: 'meta-nick',
            profileImage: 'https://example.com/meta.jpg',
          },
        },
      },
      error: null,
    });
    selectMaybeSingle.mockResolvedValue({
      data: {
        name: '홍길동',
        nickname: 'gildong',
        profile_image: 'https://example.com/db.jpg',
      },
      error: null,
    });

    const result = await getUserData();

    expect(result).toEqual({
      ok: true,
      data: {
        id: '123',
        email: 'test@example.com',
        name: '홍길동',
        nickname: 'gildong',
        profileImage: 'https://example.com/db.jpg',
      },
    });
  });

  it('users 테이블 값이 없으면 metadata fallback으로 반환해야 한다', async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: {
        user: {
          id: '123',
          email: 'test@example.com',
          user_metadata: {
            name: '메타 이름',
            nickname: 'meta-nick',
            profileImage: 'https://example.com/meta.jpg',
          },
        },
      },
      error: null,
    });
    selectMaybeSingle.mockResolvedValue({
      data: null,
      error: null,
    });

    const result = await getUserData();

    expect(result).toEqual({
      ok: true,
      data: {
        id: '123',
        email: 'test@example.com',
        name: '메타 이름',
        nickname: 'meta-nick',
        profileImage: 'https://example.com/meta.jpg',
      },
    });
  });

  it('인증되지 않은 사용자는 user-not-found 에러를 반환해야 한다', async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null,
    });

    const result = await getUserData();

    expect(result).toEqual({
      ok: false,
      error: 'user-not-found',
      message: '사용자 정보를 불러올 수 없습니다.',
    });
  });

  it('Supabase 에러 발생 시 에러를 반환해야 한다', async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'Auth session missing' },
    });

    const result = await getUserData();

    expect(result).toEqual({
      ok: false,
      error: 'user-not-found',
      message: 'Auth session missing',
    });
  });
});
