import { createSupabaseServerClient } from '@/libs/supabase/server';

import { updateAppointmentStatusAction } from './updateStatus';

jest.mock('@/libs/supabase/server');

describe('updateAppointmentStatusAction', () => {
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
      data: [{ ok: true, error_code: null, status: 'pending' }],
      error: null,
    });
  });

  it('약속 ID 형식이 올바르지 않으면 invalid-format을 반환한다', async () => {
    const result = await updateAppointmentStatusAction({
      appointmentId: 'invalid-id',
      status: 'pending',
    });

    expect(result).toEqual({
      ok: false,
      error: 'invalid-format',
      message: '유효한 약속 ID가 아닙니다.',
    });
  });

  it('RPC 호출이 성공하면 변경된 상태를 반환한다', async () => {
    const appointmentId = '550e8400-e29b-41d4-a716-446655440000';
    rpc.mockResolvedValueOnce({
      data: [{ ok: true, error_code: null, status: 'canceled' }],
      error: null,
    });
    const result = await updateAppointmentStatusAction({
      appointmentId,
      status: 'canceled',
    });

    expect(rpc).toHaveBeenCalledWith('update_appointment_status_transactional', {
      p_user_id: '550e8400-e29b-41d4-a716-446655440123',
      p_appointment_id: appointmentId,
      p_status: 'canceled',
    });
    expect(result).toEqual({
      ok: true,
      data: { status: 'canceled' },
    });
  });
});
