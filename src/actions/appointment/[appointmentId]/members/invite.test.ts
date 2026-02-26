import { requireUser } from '@/actions/_common/guards';

import { sendAppointmentInvitationAction } from './invite';

jest.mock('@/actions/_common/guards', () => {
  const actual = jest.requireActual('@/actions/_common/guards');

  return {
    ...actual,
    requireUser: jest.fn(),
  };
});

const APPOINTMENT_ID = '10000000-0000-4000-8000-000000000001';
const INVITER_ID = '10000000-0000-4000-8000-000000000002';
const INVITEE_ID = '10000000-0000-4000-8000-000000000003';

describe('sendAppointmentInvitationAction', () => {
  const mockRequireUser = requireUser as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('약속 ID 형식이 올바르지 않으면 invalid-format을 반환한다', async () => {
    const result = await sendAppointmentInvitationAction('invalid-id', INVITEE_ID);

    expect(result).toEqual({
      ok: false,
      error: 'invalid-format',
      message: '유효한 약속 ID가 아닙니다.',
    });
  });

  it('취소된 약속은 초대를 차단한다', async () => {
    const rpc = jest.fn().mockResolvedValue({
      data: [{ ok: false, error_code: 'forbidden-appointment-canceled' }],
      error: null,
    });
    const supabase = { rpc };

    mockRequireUser.mockResolvedValue({
      ok: true,
      supabase,
      user: { id: INVITER_ID },
    });

    const result = await sendAppointmentInvitationAction(APPOINTMENT_ID, INVITEE_ID);

    expect(rpc).toHaveBeenCalledWith('send_appointment_invitation_transactional', {
      p_inviter_id: INVITER_ID,
      p_appointment_id: APPOINTMENT_ID,
      p_invitee_id: INVITEE_ID,
    });
    expect(result).toEqual({
      ok: false,
      error: 'forbidden',
      message: '취소된 약속은 초대할 수 없습니다.',
    });
  });

  it('종료된 약속은 초대를 차단한다', async () => {
    const rpc = jest.fn().mockResolvedValue({
      data: [{ ok: false, error_code: 'forbidden-appointment-ended' }],
      error: null,
    });
    const supabase = { rpc };

    mockRequireUser.mockResolvedValue({
      ok: true,
      supabase,
      user: { id: INVITER_ID },
    });

    const result = await sendAppointmentInvitationAction(APPOINTMENT_ID, INVITEE_ID);

    expect(result).toEqual({
      ok: false,
      error: 'forbidden',
      message: '종료된 약속은 초대할 수 없습니다.',
    });
  });

  it('약속을 찾을 수 없으면 appointment-not-found를 반환한다', async () => {
    const rpc = jest.fn().mockResolvedValue({
      data: [{ ok: false, error_code: 'appointment-not-found' }],
      error: null,
    });
    const supabase = { rpc };

    mockRequireUser.mockResolvedValue({
      ok: true,
      supabase,
      user: { id: INVITER_ID },
    });

    const result = await sendAppointmentInvitationAction(APPOINTMENT_ID, INVITEE_ID);

    expect(result).toEqual({
      ok: false,
      error: 'appointment-not-found',
      message: '약속 정보를 찾을 수 없습니다.',
    });
  });

  it('이미 멤버인 사용자는 초대를 차단한다', async () => {
    const rpc = jest.fn().mockResolvedValue({
      data: [{ ok: false, error_code: 'already-member' }],
      error: null,
    });
    const supabase = { rpc };

    mockRequireUser.mockResolvedValue({
      ok: true,
      supabase,
      user: { id: INVITER_ID },
    });

    const result = await sendAppointmentInvitationAction(APPOINTMENT_ID, INVITEE_ID);

    expect(result).toEqual({
      ok: false,
      error: 'already-member',
      message: '이미 약속에 참여한 사용자입니다.',
    });
  });

  it('정상 요청이면 초대 전송에 성공한다', async () => {
    const rpc = jest.fn().mockResolvedValue({
      data: [{ ok: true, error_code: null }],
      error: null,
    });
    const supabase = { rpc };

    mockRequireUser.mockResolvedValue({
      ok: true,
      supabase,
      user: { id: INVITER_ID },
    });

    const result = await sendAppointmentInvitationAction(APPOINTMENT_ID, INVITEE_ID);

    expect(result).toEqual({
      ok: true,
    });
  });
});
