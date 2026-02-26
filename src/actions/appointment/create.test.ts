import { requireUser } from '@/actions/_common/guards';

import { createAppointmentAction } from './create';

jest.mock('@/actions/_common/guards', () => {
  const actual = jest.requireActual('@/actions/_common/guards');

  return {
    ...actual,
    requireUser: jest.fn(),
  };
});

describe('createAppointmentAction', () => {
  const mockRequireUser = requireUser as jest.Mock;
  const userId = '20000000-0000-4000-8000-000000000001';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('종료 시간이 시작 시간보다 이르면 invalid-time을 반환한다', async () => {
    const result = await createAppointmentAction({
      title: '점심 약속',
      date: '2026-02-02',
      startTime: '14:00',
      endTime: '13:00',
      place: {
        kakaoId: '123',
        name: '테스트 장소',
        address: '서울시',
        roadAddress: null,
        category: null,
        latitude: 37.5,
        longitude: 127.0,
      },
    });

    expect(result).toEqual({
      ok: false,
      error: 'invalid-time',
      message: '종료 시간이 시작 시간보다 늦어야 합니다.',
    });
  });

  it('그룹이 없으면 missing-group을 반환한다', async () => {
    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);
    const rpc = jest.fn().mockResolvedValue({
      data: null,
      error: {
        code: 'P0001',
        message: 'missing-group',
      },
    });

    mockRequireUser.mockResolvedValue({
      ok: true,
      supabase: { rpc },
      user: { id: userId },
    });

    try {
      const result = await createAppointmentAction({
        title: '점심 약속',
        date: '2026-02-02',
        startTime: '12:00',
        endTime: '13:00',
        place: {
          kakaoId: '123',
          name: '테스트 장소',
          address: '서울시',
          roadAddress: null,
          category: null,
          latitude: 37.5,
          longitude: 127.0,
        },
      });

      expect(result).toEqual({
        ok: false,
        error: 'missing-group',
        message: '가입한 그룹이 없습니다.',
      });
    } finally {
      consoleErrorSpy.mockRestore();
    }
  });

  it('RPC가 성공하면 appointmentId를 반환한다', async () => {
    const appointmentId = '20000000-0000-4000-8000-000000000111';
    const rpc = jest.fn().mockResolvedValue({
      data: [
        {
          appointment_id: appointmentId,
          place_id: '20000000-0000-4000-8000-000000000211',
        },
      ],
      error: null,
    });

    mockRequireUser.mockResolvedValue({
      ok: true,
      supabase: { rpc },
      user: { id: userId },
    });

    const result = await createAppointmentAction({
      title: '점심 약속',
      date: '2026-02-02',
      startTime: '12:00',
      endTime: '13:00',
      place: {
        kakaoId: '123',
        name: '테스트 장소',
        address: '서울시',
        roadAddress: null,
        category: null,
        latitude: 37.5,
        longitude: 127.0,
      },
    });

    expect(rpc).toHaveBeenCalledWith(
      'create_appointment_with_owner_member',
      expect.objectContaining({
        p_user_id: userId,
        p_group_id: null,
      }),
    );
    expect(result).toEqual({
      ok: true,
      data: {
        appointmentId,
      },
    });
  });
});
