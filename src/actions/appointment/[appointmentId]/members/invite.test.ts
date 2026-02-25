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

type AppointmentQueryResult = {
  appointment_id: string;
  group_id: string;
  status: 'pending' | 'confirmed' | 'canceled';
  ends_at: string;
} | null;

function createAppointmentSupabaseMock(result: AppointmentQueryResult) {
  const appointmentsQuery = {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    maybeSingle: jest.fn().mockResolvedValue({
      data: result,
      error: null,
    }),
  };

  const supabase = {
    from: jest.fn((table: string) => {
      if (table === 'appointments') {
        return appointmentsQuery;
      }

      throw new Error(`unexpected table access: ${table}`);
    }),
  };

  return { supabase, appointmentsQuery };
}

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
    const { supabase } = createAppointmentSupabaseMock({
      appointment_id: APPOINTMENT_ID,
      group_id: '10000000-0000-4000-8000-000000000009',
      status: 'canceled',
      ends_at: new Date(Date.now() + 60_000).toISOString(),
    });

    mockRequireUser.mockResolvedValue({
      ok: true,
      supabase,
      user: { id: INVITER_ID },
    });

    const result = await sendAppointmentInvitationAction(APPOINTMENT_ID, INVITEE_ID);

    expect(result).toEqual({
      ok: false,
      error: 'forbidden',
      message: '취소된 약속은 초대할 수 없습니다.',
    });
  });

  it('종료된 약속은 초대를 차단한다', async () => {
    const { supabase } = createAppointmentSupabaseMock({
      appointment_id: APPOINTMENT_ID,
      group_id: '10000000-0000-4000-8000-000000000009',
      status: 'pending',
      ends_at: new Date(Date.now() - 60_000).toISOString(),
    });

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
});
