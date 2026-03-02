import { requireUser } from '@/actions/_common/guards';

import { hasPendingInvitationsAction } from './hasPending';

jest.mock('@/actions/_common/guards', () => {
  const actual = jest.requireActual('@/actions/_common/guards');

  return {
    ...actual,
    requireUser: jest.fn(),
  };
});

describe('hasPendingInvitationsAction', () => {
  const mockRequireUser = requireUser as jest.Mock;
  const userId = '20000000-0000-4000-8000-000000000001';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('인증 실패는 그대로 반환한다', async () => {
    mockRequireUser.mockResolvedValue({
      ok: false,
      error: 'unauthorized',
      message: '로그인이 필요합니다.',
    });

    const result = await hasPendingInvitationsAction();

    expect(result).toEqual({
      ok: false,
      error: 'unauthorized',
      message: '로그인이 필요합니다.',
    });
  });

  it('조회 실패 시 server-error를 반환한다', async () => {
    const secondEq = jest.fn().mockResolvedValue({
      count: null,
      error: { message: 'db failed' },
    });
    const firstEq = jest.fn().mockReturnValue({
      eq: secondEq,
    });
    const select = jest.fn().mockReturnValue({
      eq: firstEq,
    });
    const from = jest.fn().mockReturnValue({
      select,
    });

    mockRequireUser.mockResolvedValue({
      ok: true,
      supabase: { from },
      user: { id: userId },
    });

    const result = await hasPendingInvitationsAction();

    expect(from).toHaveBeenCalledWith('invitations');
    expect(select).toHaveBeenCalledWith('invitation_id', {
      count: 'exact',
      head: true,
    });
    expect(firstEq).toHaveBeenCalledWith('invitee_id', userId);
    expect(secondEq).toHaveBeenCalledWith('status', 'pending');
    expect(result).toEqual({
      ok: false,
      error: 'server-error',
      message: '알림 상태를 확인하지 못했습니다.',
    });
  });

  it('pending 초대가 있으면 true를 반환한다', async () => {
    const secondEq = jest.fn().mockResolvedValue({
      count: 2,
      error: null,
    });
    const firstEq = jest.fn().mockReturnValue({
      eq: secondEq,
    });
    const select = jest.fn().mockReturnValue({
      eq: firstEq,
    });
    const from = jest.fn().mockReturnValue({
      select,
    });

    mockRequireUser.mockResolvedValue({
      ok: true,
      supabase: { from },
      user: { id: userId },
    });

    const result = await hasPendingInvitationsAction();

    expect(result).toEqual({
      ok: true,
      data: {
        hasPendingInvitations: true,
      },
    });
  });

  it('pending 초대가 없으면 false를 반환한다', async () => {
    const secondEq = jest.fn().mockResolvedValue({
      count: 0,
      error: null,
    });
    const firstEq = jest.fn().mockReturnValue({
      eq: secondEq,
    });
    const select = jest.fn().mockReturnValue({
      eq: firstEq,
    });
    const from = jest.fn().mockReturnValue({
      select,
    });

    mockRequireUser.mockResolvedValue({
      ok: true,
      supabase: { from },
      user: { id: userId },
    });

    const result = await hasPendingInvitationsAction();

    expect(result).toEqual({
      ok: true,
      data: {
        hasPendingInvitations: false,
      },
    });
  });
});
