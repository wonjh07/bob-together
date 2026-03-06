import { requireUserService } from '@/actions/_common/guards';

import { searchAppointmentsByTitleAction } from './search';

jest.mock('@/actions/_common/guards', () => {
  const actual = jest.requireActual('@/actions/_common/guards');

  return {
    ...actual,
    requireUserService: jest.fn(),
  };
});

describe('searchAppointmentsByTitleAction', () => {
  const mockRequireUserService = requireUserService as jest.Mock;
  const userId = '20000000-0000-4000-8000-000000000001';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('검색어가 짧으면 invalid-format을 반환한다', async () => {
    const result = await searchAppointmentsByTitleAction({
      query: 'a',
    });

    expect(result).toMatchObject({
      ok: false,
      errorType: 'validation',
      message: '검색어를 2자 이상 입력해주세요.',
    });
  });

  it('인증 실패는 그대로 반환한다', async () => {
    mockRequireUserService.mockResolvedValue({
      ok: false,
      requestId: 'req-unauthorized',
      errorType: 'auth',
      message: '로그인이 필요합니다.',
    });

    const result = await searchAppointmentsByTitleAction({
      query: '점심',
    });

    expect(result).toMatchObject({
      ok: false,
      errorType: 'auth',
      message: '로그인이 필요합니다.',
    });
  });

  it('RPC 실패 시 server-error를 반환한다', async () => {
    const supabase = {
      rpc: jest.fn().mockResolvedValue({
        data: null,
        error: { message: 'rpc failed' },
      }),
    };

    mockRequireUserService.mockResolvedValue({
      ok: true,
      supabase,
      user: { id: userId },
    });

    const result = await searchAppointmentsByTitleAction({
      query: '점심',
      limit: 2,
    });

    expect(result).toMatchObject({
      ok: false,
      errorType: 'server',
      message: '약속 검색 중 오류가 발생했습니다.',
    });
  });

  it('검색 결과를 매핑하고 nextCursor를 계산한다', async () => {
    const supabase = {
      rpc: jest.fn().mockResolvedValue({
        data: [
          {
            appointment_id: '20000000-0000-4000-8000-000000000201',
            title: '점심 약속',
            start_at: '2026-02-25T12:00:00.000Z',
            ends_at: '2026-02-25T13:00:00.000Z',
            host_name: '홍길동',
            host_nickname: '길동',
            host_profile_image: null,
            member_count: 3,
          },
          {
            appointment_id: '20000000-0000-4000-8000-000000000202',
            title: '저녁 약속',
            start_at: '2026-02-24T18:00:00.000Z',
            ends_at: '2026-02-24T19:00:00.000Z',
            host_name: '김철수',
            host_nickname: null,
            host_profile_image: 'https://example.com/profile.png',
            member_count: 2,
          },
          {
            appointment_id: '20000000-0000-4000-8000-000000000203',
            title: '아침 약속',
            start_at: '2026-02-23T08:00:00.000Z',
            ends_at: '2026-02-23T09:00:00.000Z',
            host_name: null,
            host_nickname: null,
            host_profile_image: null,
            member_count: 1,
          },
        ],
        error: null,
      }),
    };

    mockRequireUserService.mockResolvedValue({
      ok: true,
      supabase,
      user: { id: userId },
    });

    const result = await searchAppointmentsByTitleAction({
      query: '약속',
      limit: 2,
      cursor: {
        startAt: '2026-02-26T00:00:00.000Z',
        appointmentId: '20000000-0000-4000-8000-000000000299',
      },
    });

    expect(supabase.rpc).toHaveBeenCalledWith('search_appointments_with_count', {
      p_user_id: userId,
      p_query: '약속',
      p_limit: 2,
      p_cursor_start_at: '2026-02-26T00:00:00.000Z',
      p_cursor_appointment_id: '20000000-0000-4000-8000-000000000299',
    });
    expect(result).toMatchObject({
      ok: true,
      data: {
        appointments: [
          {
            appointmentId: '20000000-0000-4000-8000-000000000201',
            title: '점심 약속',
            startAt: '2026-02-25T12:00:00.000Z',
            endsAt: '2026-02-25T13:00:00.000Z',
            hostName: '홍길동',
            hostNickname: '길동',
            hostProfileImage: null,
            memberCount: 3,
          },
          {
            appointmentId: '20000000-0000-4000-8000-000000000202',
            title: '저녁 약속',
            startAt: '2026-02-24T18:00:00.000Z',
            endsAt: '2026-02-24T19:00:00.000Z',
            hostName: '김철수',
            hostNickname: null,
            hostProfileImage: 'https://example.com/profile.png',
            memberCount: 2,
          },
        ],
        nextCursor: {
          startAt: '2026-02-24T18:00:00.000Z',
          appointmentId: '20000000-0000-4000-8000-000000000202',
        },
      },
    });
  });
});
