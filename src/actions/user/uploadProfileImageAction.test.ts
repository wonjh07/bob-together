import {
  createSupabaseServerClient,
} from '@/libs/supabase/server';

import { uploadProfileImageAction } from './uploadProfileImageAction';

jest.mock('@/libs/supabase/server');

describe('uploadProfileImageAction', () => {
  const rpc = jest.fn();
  const storageUpload = jest.fn();
  const storageRemove = jest.fn();
  const storageGetPublicUrl = jest.fn();

  const storageBucket = {
    upload: storageUpload,
    remove: storageRemove,
    getPublicUrl: storageGetPublicUrl,
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
    storageUpload.mockResolvedValue({ error: null });
    storageRemove.mockResolvedValue({ error: null });
    storageGetPublicUrl.mockReturnValue({
      data: {
        publicUrl:
          'https://example.com/storage/v1/object/public/profile-images/123/avatar-new.jpg',
      },
    });
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: {
        user: {
          id: '123',
          email: 'test@example.com',
          user_metadata: {
            name: '메타 이름',
            nickname: 'meta-nick',
          },
        },
      },
      error: null,
    });
    mockSupabaseClient.auth.updateUser.mockResolvedValue({ error: null });
  });

  it('파일이 없으면 invalid-file 에러를 반환해야 한다', async () => {
    const formData = new FormData();

    const result = await uploadProfileImageAction(formData);

    expect(result).toEqual({
      ok: false,
      error: 'invalid-file',
      message: '이미지 파일을 선택해주세요.',
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

      const formData = new FormData();
      const file = new File(['jpeg data'], 'profile.jpg', { type: 'image/jpeg' });
      formData.append('file', file);

      const result = await uploadProfileImageAction(formData);

      expect(result).toEqual({
        ok: false,
        error: 'metadata-sync-failed',
        message: '프로필 이미지는 저장되었지만 계정 정보 동기화에 실패했습니다.',
      });
      expect(rpc).toHaveBeenCalledWith(
        'set_user_profile_image_transactional',
        {
          p_user_id: '123',
          p_profile_image:
            'https://example.com/storage/v1/object/public/profile-images/123/avatar-new.jpg',
        },
      );
      expect(storageRemove).toHaveBeenCalledWith(['123/avatar-old.jpg']);
      expect(consoleErrorSpy).toHaveBeenCalled();
    } finally {
      consoleErrorSpy.mockRestore();
    }
  });

  it('이전 profile_image URL 파싱에 실패해도 업로드 성공을 반환해야 한다', async () => {
    rpc.mockResolvedValue({
      data: [
        {
          ok: true,
          error_code: null,
          previous_profile_image: 'not-a-valid-url',
        },
      ],
      error: null,
    });

    const formData = new FormData();
    const file = new File(['jpeg data'], 'profile.jpg', { type: 'image/jpeg' });
    formData.append('file', file);

    const result = await uploadProfileImageAction(formData);

    expect(result.ok).toBe(true);
    expect(storageRemove).not.toHaveBeenCalledWith(['not-a-valid-url']);
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

    const formData = new FormData();
    const file = new File(['jpeg data'], 'profile.jpg', { type: 'image/jpeg' });
    formData.append('file', file);

    const result = await uploadProfileImageAction(formData);

    expect(result).toEqual({
      ok: false,
      error: 'profile-not-found',
      message: '프로필 정보를 찾을 수 없습니다.',
    });
    expect(storageRemove).toHaveBeenCalled();
  });
});
