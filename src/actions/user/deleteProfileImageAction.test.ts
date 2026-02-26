import {
  createSupabaseServerClient,
} from '@/libs/supabase/server';

import { deleteProfileImageAction } from './deleteProfileImageAction';

jest.mock('@/libs/supabase/server');

describe('deleteProfileImageAction', () => {
  const rpc = jest.fn();
  const storageRemove = jest.fn();

  const storageBucket = {
    remove: storageRemove,
  };
  const mockSupabaseClient = {
    auth: {
      getUser: jest.fn(),
      updateUser: jest.fn(),
    },
    rpc,
    storage: {
      from: jest.fn(() => storageBucket),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();

    (createSupabaseServerClient as jest.Mock).mockReturnValue(mockSupabaseClient);

    rpc.mockResolvedValue({
      data: [{ ok: true, error_code: null, previous_profile_image: null }],
      error: null,
    });
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

  it('사용자가 없으면 unauthorized를 반환해야 한다', async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null,
    });

    const result = await deleteProfileImageAction();

    expect(result).toEqual({
      ok: false,
      error: 'unauthorized',
      message: '로그인이 필요합니다.',
    });
  });

  it('storage 삭제 실패여도 DB 업데이트가 되면 성공을 반환해야 한다', async () => {
    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);

    try {
      rpc.mockResolvedValue({
        data: [
          {
            ok: true,
            error_code: null,
            previous_profile_image:
              'https://example.com/storage/v1/object/public/profile-images/123/avatar-old.jpg',
          },
        ],
        error: null,
      });
      storageRemove.mockResolvedValue({
        error: { message: 'remove fail' },
      });

      const result = await deleteProfileImageAction();

      expect(result).toEqual({ ok: true });
      expect(rpc).toHaveBeenCalledWith(
        'clear_user_profile_image_transactional',
        { p_user_id: '123' },
      );
      expect(storageRemove).toHaveBeenCalledWith(['123/avatar-old.jpg']);
      expect(consoleErrorSpy).toHaveBeenCalled();
    } finally {
      consoleErrorSpy.mockRestore();
    }
  });

  it('profile_image URL 파싱에 실패해도 삭제 성공을 반환해야 한다', async () => {
    rpc.mockResolvedValue({
      data: [
        {
          ok: true,
          error_code: null,
          previous_profile_image: 'invalid-url-format',
        },
      ],
      error: null,
    });

    const result = await deleteProfileImageAction();

    expect(result).toEqual({ ok: true });
    expect(rpc).toHaveBeenCalled();
    expect(storageRemove).not.toHaveBeenCalledWith(['invalid-url-format']);
  });

  it('RPC가 not-found를 반환하면 profile-not-found를 반환해야 한다', async () => {
    rpc.mockResolvedValue({
      data: [
        {
          ok: false,
          error_code: 'not-found',
          previous_profile_image: null,
        },
      ],
      error: null,
    });

    const result = await deleteProfileImageAction();

    expect(result).toEqual({
      ok: false,
      error: 'profile-not-found',
      message: '프로필 정보를 찾을 수 없습니다.',
    });
  });

  it('metadata 동기화 실패 시 metadata-sync-failed를 반환해야 한다', async () => {
    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);

    try {
      rpc.mockResolvedValue({
        data: [
          {
            ok: true,
            error_code: null,
            previous_profile_image:
              'https://example.com/storage/v1/object/public/profile-images/123/avatar-old.jpg',
          },
        ],
        error: null,
      });
      mockSupabaseClient.auth.updateUser.mockResolvedValue({
        error: { message: 'metadata fail' },
      });

      const result = await deleteProfileImageAction();

      expect(result).toEqual({
        ok: false,
        error: 'metadata-sync-failed',
        message: '프로필 이미지는 삭제되었지만 계정 정보 동기화에 실패했습니다.',
      });
      expect(storageRemove).toHaveBeenCalledWith(['123/avatar-old.jpg']);
      expect(consoleErrorSpy).toHaveBeenCalled();
    } finally {
      consoleErrorSpy.mockRestore();
    }
  });
});
