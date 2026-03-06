import { requireUserService } from '@/actions/_common/guards';

import { joinAppointmentAction } from './join';

jest.mock('@/actions/_common/guards', () => {
  const actual = jest.requireActual('@/actions/_common/guards');

  return {
    ...actual,
    requireUserService: jest.fn(),
  };
});

describe('joinAppointmentAction', () => {
  const mockRequireUserService = requireUserService as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('약속 ID 형식이 올바르지 않으면 invalid-format을 반환한다', async () => {
    const result = await joinAppointmentAction('invalid-id');

    expect(result).toMatchObject({
      ok: false,
      errorType: 'validation',
      message: '유효한 약속 ID가 아닙니다.',
    });
  });

  it('약속을 찾을 수 없으면 appointment-not-found를 반환한다', async () => {
    const rpc = jest.fn().mockResolvedValue({
      data: [{ ok: false, error_code: 'appointment-not-found' }],
      error: null,
    });

    mockRequireUserService.mockResolvedValue({
      ok: true,
      supabase: { rpc },
      user: { id: '550e8400-e29b-41d4-a716-446655440123' },
      requestId: 'req-test',
    });

    const result = await joinAppointmentAction('550e8400-e29b-41d4-a716-446655440000');

    expect(result).toMatchObject({
      ok: false,
      errorType: 'not_found',
      message: '약속 정보를 찾을 수 없습니다.',
    });
  });
});
