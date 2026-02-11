import {
  createSupabaseServerClient,
} from '@/libs/supabase/server';

import { deleteProfileImageAction } from './deleteProfileImageAction';

jest.mock('@/libs/supabase/server');

describe('deleteProfileImageAction', () => {
  const selectMaybeSingle = jest.fn();
  const updateMaybeSingle = jest.fn();
  const storageRemove = jest.fn();

  const usersSelectChain = {
    eq: jest.fn(() => ({
      maybeSingle: selectMaybeSingle,
    })),
  };
  const usersUpdateSelectChain = {
    maybeSingle: updateMaybeSingle,
  };
  const usersUpdateEqChain = {
    select: jest.fn(() => usersUpdateSelectChain),
  };
  const usersUpdateChain = {
    eq: jest.fn(() => usersUpdateEqChain),
  };
  const usersTable = {
    select: jest.fn(() => usersSelectChain),
    update: jest.fn(() => usersUpdateChain),
  };
  const storageBucket = {
    remove: storageRemove,
  };
  const mockSupabaseClient = {
    auth: {
      getUser: jest.fn(),
      updateUser: jest.fn(),
    },
    from: jest.fn((table: string) => {
      if (table === 'users') {
        return usersTable;
      }
      throw new Error(`Unexpected table: ${table}`);
    }),
    storage: {
      from: jest.fn(() => storageBucket),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();

    (createSupabaseServerClient as jest.Mock).mockReturnValue(mockSupabaseClient);

    selectMaybeSingle.mockResolvedValue({ data: null, error: null });
    updateMaybeSingle.mockResolvedValue({ data: { user_id: '123' }, error: null });
    storageRemove.mockResolvedValue({ error: null });
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: {
        user: {
          id: '123',
          user_metadata: {},
        },
      },
      error: null,
    });
    mockSupabaseClient.auth.updateUser.mockResolvedValue({ error: null });
  });

  it('사용자가 없으면 user-not-found를 반환해야 한다', async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null,
    });

    const result = await deleteProfileImageAction();

    expect(result).toEqual({
      ok: false,
      error: 'user-not-found',
      message: '로그인 정보를 확인할 수 없습니다.',
    });
  });

  it('storage 삭제 실패여도 DB 업데이트가 되면 성공을 반환해야 한다', async () => {
    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);

    try {
      selectMaybeSingle.mockResolvedValue({
        data: {
          profile_image:
            'https://example.com/storage/v1/object/public/profile-images/123/avatar-old.jpg',
        },
        error: null,
      });
      storageRemove.mockResolvedValue({
        error: { message: 'remove fail' },
      });

      const result = await deleteProfileImageAction();

      expect(result).toEqual({ ok: true, data: undefined });
      expect(updateMaybeSingle).toHaveBeenCalled();
      expect(storageRemove).toHaveBeenCalledWith(['123/avatar-old.jpg']);
      expect(consoleErrorSpy).toHaveBeenCalled();
    } finally {
      consoleErrorSpy.mockRestore();
    }
  });

  it('profile_image URL 파싱에 실패해도 삭제 성공을 반환해야 한다', async () => {
    selectMaybeSingle.mockResolvedValue({
      data: {
        profile_image: 'invalid-url-format',
      },
      error: null,
    });

    const result = await deleteProfileImageAction();

    expect(result).toEqual({ ok: true, data: undefined });
    expect(updateMaybeSingle).toHaveBeenCalled();
    expect(storageRemove).not.toHaveBeenCalledWith(['invalid-url-format']);
  });
});
