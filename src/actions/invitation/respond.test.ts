import { requireUserService } from '@/actions/_common/guards';

import { respondToInvitationAction } from './respond';

jest.mock('@/actions/_common/guards', () => {
  const actual = jest.requireActual('@/actions/_common/guards');

  return {
    ...actual,
    requireUserService: jest.fn(),
  };
});

describe('respondToInvitationAction', () => {
  const mockRequireUserService = requireUserService as jest.Mock;
  const userId = '20000000-0000-4000-8000-000000000001';
  const invitationId = '20000000-0000-4000-8000-000000000101';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('초대 ID 형식이 올바르지 않으면 invalid-format을 반환한다', async () => {
    const result = await respondToInvitationAction({
      invitationId: 'invalid-id',
      decision: 'accepted',
    });

    expect(result).toMatchObject({
      ok: false,
      errorType: 'validation',
      message: '유효한 초대 ID가 아닙니다.',
    });
  });

  it('종료된 약속이면 명시적인 forbidden 메시지를 반환한다', async () => {
    const rpc = jest.fn().mockResolvedValue({
      data: [{
        ok: false,
        error_code: 'forbidden-appointment-ended',
        invitation_id: invitationId,
        invitation_type: 'appointment',
        group_id: '20000000-0000-4000-8000-000000000201',
        appointment_id: '20000000-0000-4000-8000-000000000301',
        status: 'pending',
      }],
      error: null,
    });

    mockRequireUserService.mockResolvedValue({
      ok: true,
      supabase: { rpc },
      user: { id: userId },
    });

    const result = await respondToInvitationAction({
      invitationId,
      decision: 'accepted',
    });

    expect(result).toMatchObject({
      ok: false,
      errorType: 'permission',
      message: '종료된 약속은 수락할 수 없습니다.',
    });
  });

  it('취소된 약속이면 명시적인 forbidden 메시지를 반환한다', async () => {
    const rpc = jest.fn().mockResolvedValue({
      data: [{
        ok: false,
        error_code: 'forbidden-appointment-canceled',
        invitation_id: invitationId,
        invitation_type: 'appointment',
        group_id: '20000000-0000-4000-8000-000000000201',
        appointment_id: '20000000-0000-4000-8000-000000000301',
        status: 'pending',
      }],
      error: null,
    });

    mockRequireUserService.mockResolvedValue({
      ok: true,
      supabase: { rpc },
      user: { id: userId },
    });

    const result = await respondToInvitationAction({
      invitationId,
      decision: 'accepted',
    });

    expect(result).toMatchObject({
      ok: false,
      errorType: 'permission',
      message: '취소된 약속은 수락할 수 없습니다.',
    });
  });

  it('응답이 성공하면 상태를 반환한다', async () => {
    const rpc = jest.fn().mockResolvedValue({
      data: [{
        ok: true,
        error_code: null,
        invitation_id: invitationId,
        invitation_type: 'appointment',
        group_id: '20000000-0000-4000-8000-000000000201',
        appointment_id: '20000000-0000-4000-8000-000000000301',
        status: 'accepted',
      }],
      error: null,
    });

    mockRequireUserService.mockResolvedValue({
      ok: true,
      supabase: { rpc },
      user: { id: userId },
    });

    const result = await respondToInvitationAction({
      invitationId,
      decision: 'accepted',
    });

    expect(result).toMatchObject({
      ok: true,
      data: {
        invitationId,
        status: 'accepted',
        type: 'appointment',
        groupId: '20000000-0000-4000-8000-000000000201',
        appointmentId: '20000000-0000-4000-8000-000000000301',
      },
    });
  });
});
