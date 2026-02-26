import { requireUser } from '@/actions/_common/guards';

import { listReceivedInvitationsAction } from './listReceived';

jest.mock('@/actions/_common/guards', () => {
  const actual = jest.requireActual('@/actions/_common/guards');

  return {
    ...actual,
    requireUser: jest.fn(),
  };
});

describe('listReceivedInvitationsAction', () => {
  const mockRequireUser = requireUser as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('빈 결과를 반환한다', async () => {
    const rpc = jest.fn().mockResolvedValue({
      data: [],
      error: null,
    });
    const supabase = {
      rpc,
    };

    mockRequireUser.mockResolvedValue({
      ok: true,
      supabase,
      user: { id: '20000000-0000-4000-8000-000000000001' },
    });

    const result = await listReceivedInvitationsAction({ limit: 2 });

    expect(rpc).toHaveBeenCalledWith(
      'list_received_invitations_with_cursor',
      {
        p_limit: 2,
        p_cursor_created_time: null,
        p_cursor_invitation_id: null,
      },
    );
    expect(result).toEqual({
      ok: true,
      data: {
        invitations: [],
        nextCursor: null,
      },
    });
  });

  it('RPC 에러면 server-error를 반환한다', async () => {
    const rpc = jest.fn().mockResolvedValue({
      data: null,
      error: { message: 'rpc failed' },
    });
    const supabase = {
      rpc,
    };

    mockRequireUser.mockResolvedValue({
      ok: true,
      supabase,
      user: { id: '20000000-0000-4000-8000-000000000001' },
    });

    const result = await listReceivedInvitationsAction();

    expect(result).toEqual({
      ok: false,
      error: 'server-error',
      message: '알림 목록을 불러오지 못했습니다.',
    });
  });

  it('RPC 키셋 커서 기반으로 nextCursor를 계산한다', async () => {
    const rpc = jest.fn().mockResolvedValue({
      data: [
        {
          invitation_id: '20000000-0000-4000-8000-000000000101',
          type: 'group',
          status: 'pending',
          created_time: '2026-02-25T10:03:00.000Z',
          group_id: '20000000-0000-4000-8000-000000000201',
          appointment_id: null,
          inviter_id: '20000000-0000-4000-8000-000000000301',
          inviter_name: '초대자1',
          inviter_nickname: 'inviter1',
          inviter_profile_image: null,
          group_name: '그룹1',
          appointment_title: null,
          appointment_ends_at: null,
        },
        {
          invitation_id: '20000000-0000-4000-8000-000000000102',
          type: 'appointment',
          status: 'accepted',
          created_time: '2026-02-25T10:02:00.000Z',
          group_id: '20000000-0000-4000-8000-000000000202',
          appointment_id: '20000000-0000-4000-8000-000000000401',
          inviter_id: '20000000-0000-4000-8000-000000000302',
          inviter_name: '초대자2',
          inviter_nickname: 'inviter2',
          inviter_profile_image: null,
          group_name: '그룹2',
          appointment_title: '약속2',
          appointment_ends_at: '2026-02-25T12:00:00.000Z',
        },
        {
          invitation_id: '20000000-0000-4000-8000-000000000103',
          type: 'group',
          status: 'rejected',
          created_time: '2026-02-25T10:01:00.000Z',
          group_id: '20000000-0000-4000-8000-000000000203',
          appointment_id: null,
          inviter_id: '20000000-0000-4000-8000-000000000303',
          inviter_name: '초대자3',
          inviter_nickname: 'inviter3',
          inviter_profile_image: null,
          group_name: '그룹3',
          appointment_title: null,
          appointment_ends_at: null,
        },
      ],
      error: null,
    });
    const supabase = {
      rpc,
    };

    mockRequireUser.mockResolvedValue({
      ok: true,
      supabase,
      user: { id: '20000000-0000-4000-8000-000000000001' },
    });

    const result = await listReceivedInvitationsAction({
      cursor: {
        createdTime: '2026-02-25T10:05:00.000Z',
        invitationId: '20000000-0000-4000-8000-000000000199',
      },
      limit: 2,
    });

    expect(rpc).toHaveBeenCalledWith(
      'list_received_invitations_with_cursor',
      {
        p_limit: 2,
        p_cursor_created_time: '2026-02-25T10:05:00.000Z',
        p_cursor_invitation_id: '20000000-0000-4000-8000-000000000199',
      },
    );
    expect(result).toEqual({
      ok: true,
      data: {
        invitations: [
          {
            invitationId: '20000000-0000-4000-8000-000000000101',
            type: 'group',
            status: 'pending',
            createdTime: '2026-02-25T10:03:00.000Z',
            inviterId: '20000000-0000-4000-8000-000000000301',
            inviterName: '초대자1',
            inviterNickname: 'inviter1',
            inviterProfileImage: null,
            groupId: '20000000-0000-4000-8000-000000000201',
            groupName: '그룹1',
            appointmentId: null,
            appointmentTitle: null,
            appointmentEndsAt: null,
          },
          {
            invitationId: '20000000-0000-4000-8000-000000000102',
            type: 'appointment',
            status: 'accepted',
            createdTime: '2026-02-25T10:02:00.000Z',
            inviterId: '20000000-0000-4000-8000-000000000302',
            inviterName: '초대자2',
            inviterNickname: 'inviter2',
            inviterProfileImage: null,
            groupId: '20000000-0000-4000-8000-000000000202',
            groupName: '그룹2',
            appointmentId: '20000000-0000-4000-8000-000000000401',
            appointmentTitle: '약속2',
            appointmentEndsAt: '2026-02-25T12:00:00.000Z',
          },
        ],
        nextCursor: {
          createdTime: '2026-02-25T10:02:00.000Z',
          invitationId: '20000000-0000-4000-8000-000000000102',
        },
      },
    });
  });
});
