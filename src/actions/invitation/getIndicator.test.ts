import { requireUserService } from '@/actions/_common/guards';

import { getInvitationIndicatorAction } from './getIndicator';

jest.mock('@/actions/_common/guards', () => {
  const actual = jest.requireActual('@/actions/_common/guards');

  return {
    ...actual,
    requireUserService: jest.fn(),
  };
});

describe('getInvitationIndicatorAction', () => {
  const mockRequireUserService = requireUserService as jest.Mock;
  const userId = '20000000-0000-4000-8000-000000000001';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('인증 실패는 그대로 반환한다', async () => {
    mockRequireUserService.mockResolvedValue({
      ok: false,
      requestId: 'req-unauthorized',
      errorType: 'auth',
      message: '로그인이 필요합니다.',
    });

    const result = await getInvitationIndicatorAction();

    expect(result).toMatchObject({
      ok: false,
      errorType: 'auth',
      message: '로그인이 필요합니다.',
    });
  });

  it('조회 실패 시 server-error를 반환한다', async () => {
    const rpc = jest.fn().mockResolvedValue({
      data: null,
      error: { message: 'db failed' },
    });

    mockRequireUserService.mockResolvedValue({
      ok: true,
      supabase: { rpc },
      user: { id: userId },
    });

    const result = await getInvitationIndicatorAction();

    expect(rpc).toHaveBeenCalledWith('has_unread_invitations', {
      p_user_id: userId,
    });
    expect(result).toMatchObject({
      ok: false,
      errorType: 'server',
      message: '알림 상태를 확인하지 못했습니다.',
    });
  });

  it('읽지 않은 초대가 있으면 true를 반환한다', async () => {
    const rpc = jest.fn().mockResolvedValue({
      data: true,
      error: null,
    });

    mockRequireUserService.mockResolvedValue({
      ok: true,
      supabase: { rpc },
      user: { id: userId },
    });

    const result = await getInvitationIndicatorAction();

    expect(result).toMatchObject({
      ok: true,
      data: {
        hasUnreadInvitations: true,
      },
    });
  });

  it('읽지 않은 초대가 없으면 false를 반환한다', async () => {
    const rpc = jest.fn().mockResolvedValue({
      data: false,
      error: null,
    });

    mockRequireUserService.mockResolvedValue({
      ok: true,
      supabase: { rpc },
      user: { id: userId },
    });

    const result = await getInvitationIndicatorAction();

    expect(result).toMatchObject({
      ok: true,
      data: {
        hasUnreadInvitations: false,
      },
    });
  });
});
