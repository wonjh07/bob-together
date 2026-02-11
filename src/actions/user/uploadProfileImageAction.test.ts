import {
  createSupabaseServerClient,
} from '@/libs/supabase/server';

import { uploadProfileImageAction } from './uploadProfileImageAction';

jest.mock('@/libs/supabase/server');

describe('uploadProfileImageAction', () => {
  const selectMaybeSingle = jest.fn();
  const updateMaybeSingle = jest.fn();
  const storageUpload = jest.fn();
  const storageRemove = jest.fn();
  const storageGetPublicUrl = jest.fn();

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
    upload: storageUpload,
    remove: storageRemove,
    getPublicUrl: storageGetPublicUrl,
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

  it('metadata 동기화 실패여도 업로드 성공을 반환해야 한다', async () => {
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
      mockSupabaseClient.auth.updateUser.mockResolvedValue({
        error: { message: 'metadata fail' },
      });

      const formData = new FormData();
      const file = new File(['jpeg data'], 'profile.jpg', { type: 'image/jpeg' });
      formData.append('file', file);

      const result = await uploadProfileImageAction(formData);

      expect(result.ok).toBe(true);
      expect(storageRemove).toHaveBeenCalledWith(['123/avatar-old.jpg']);
      expect(consoleErrorSpy).toHaveBeenCalled();
    } finally {
      consoleErrorSpy.mockRestore();
    }
  });

  it('이전 profile_image URL 파싱에 실패해도 업로드 성공을 반환해야 한다', async () => {
    selectMaybeSingle.mockResolvedValue({
      data: {
        profile_image: 'not-a-valid-url',
      },
      error: null,
    });

    const formData = new FormData();
    const file = new File(['jpeg data'], 'profile.jpg', { type: 'image/jpeg' });
    formData.append('file', file);

    const result = await uploadProfileImageAction(formData);

    expect(result.ok).toBe(true);
    expect(storageRemove).not.toHaveBeenCalledWith(['not-a-valid-url']);
  });
});
