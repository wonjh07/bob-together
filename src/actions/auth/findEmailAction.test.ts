import { createSupabaseAdminClient } from '@/libs/supabase/server';

import { findEmailAction } from './findEmailAction';

jest.mock('@/libs/supabase/server');

describe('findEmailAction', () => {
  const mockLimit = jest.fn();
  const mockOrder = jest.fn();
  const mockNot = jest.fn();
  const mockEq = jest.fn();
  const mockSelect = jest.fn();
  const mockFrom = jest.fn();

  const mockSupabaseClient = {
    from: mockFrom,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockFrom.mockReturnValue({ select: mockSelect });
    mockSelect.mockReturnValue({ eq: mockEq });
    mockEq.mockReturnValue({ eq: mockEq });
    mockNot.mockReturnValue({ order: mockOrder });
    mockOrder.mockReturnValue({ limit: mockLimit });

    (createSupabaseAdminClient as jest.Mock).mockReturnValue(
      mockSupabaseClient,
    );
  });

  it('유효한 이름/닉네임이면 마스킹 이메일을 반환해야 한다', async () => {
    mockEq.mockImplementationOnce(() => ({ eq: mockEq }));
    mockEq.mockImplementationOnce(() => ({ not: mockNot }));
    mockLimit.mockResolvedValue({
      data: [{ email: 'te1234@example.com' }],
      error: null,
    });

    const result = await findEmailAction('홍길동', '길동이');

    expect(result).toEqual({
      ok: true,
      data: { maskedEmail: 'te****@example.com' },
    });
    expect(mockFrom).toHaveBeenCalledWith('users');
  });

  it('일치 계정이 없으면 user-not-found를 반환해야 한다', async () => {
    mockEq.mockImplementationOnce(() => ({ eq: mockEq }));
    mockEq.mockImplementationOnce(() => ({ not: mockNot }));
    mockLimit.mockResolvedValue({
      data: [],
      error: null,
    });

    const result = await findEmailAction('홍길동', '없는닉네임');

    expect(result).toEqual({
      ok: false,
      error: 'user-not-found',
      message: '입력한 이름과 닉네임에 해당하는 계정을 찾을 수 없습니다.',
    });
  });

  it('RPC 오류가 발생하면 server-error를 반환해야 한다', async () => {
    mockEq.mockImplementationOnce(() => ({ eq: mockEq }));
    mockEq.mockImplementationOnce(() => ({ not: mockNot }));
    mockLimit.mockResolvedValue({
      data: null,
      error: { message: 'db error' },
    });

    const result = await findEmailAction('홍길동', '길동이');

    expect(result).toEqual({
      ok: false,
      error: 'server-error',
      message: '이메일 조회 중 오류가 발생했습니다.',
    });
  });

  it('유효하지 않은 입력은 invalid-format을 반환해야 한다', async () => {
    const result = await findEmailAction('', '');

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe('invalid-format');
    }
    expect(mockFrom).not.toHaveBeenCalled();
  });
});
