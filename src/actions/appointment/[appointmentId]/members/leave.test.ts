import { createSupabaseServerClient } from '@/libs/supabase/server';

import { leaveAppointmentAction } from './leave';

jest.mock('@/libs/supabase/server');

describe('leaveAppointmentAction', () => {
  const rpc = jest.fn();
  const mockSupabaseClient = {
    auth: {
      getUser: jest.fn(),
    },
    rpc,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    (createSupabaseServerClient as jest.Mock).mockReturnValue(mockSupabaseClient);
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: {
        user: {
          id: '550e8400-e29b-41d4-a716-446655440123',
        },
      },
      error: null,
    });
    rpc.mockResolvedValue({
      data: [{ ok: true, error_code: null }],
      error: null,
    });
  });

  it('약속 ID 형식이 올바르지 않으면 invalid-format을 반환한다', async () => {
    const result = await leaveAppointmentAction('invalid-id');

    expect(result).toEqual({
      ok: false,
      error: 'invalid-format',
      message: '유효한 약속 ID가 아닙니다.',
    });
  });

  it('RPC 호출이 성공하면 나가기 처리 성공을 반환한다', async () => {
    const appointmentId = '550e8400-e29b-41d4-a716-446655440000';
    const result = await leaveAppointmentAction(appointmentId);

    expect(rpc).toHaveBeenCalledWith('leave_appointment_transactional', {
      p_user_id: '550e8400-e29b-41d4-a716-446655440123',
      p_appointment_id: appointmentId,
    });
    expect(result).toEqual({
      ok: true,
    });
  });

  it('약속을 찾을 수 없으면 appointment-not-found를 반환한다', async () => {
    rpc.mockResolvedValue({
      data: [{ ok: false, error_code: 'appointment-not-found' }],
      error: null,
    });

    const result = await leaveAppointmentAction('550e8400-e29b-41d4-a716-446655440000');

    expect(result).toEqual({
      ok: false,
      error: 'appointment-not-found',
      message: '약속 정보를 찾을 수 없습니다.',
    });
  });
});
