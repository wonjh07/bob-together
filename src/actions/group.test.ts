import { createSupabaseServerClient } from '@/libs/supabase/server';

import {
  createGroupAction,
  findGroupByNameAction,
  joinGroupAction,
  searchUsersAction,
  sendGroupInvitationAction,
} from './group';

jest.mock('@/libs/supabase/server');

const mockUser = { id: 'user-1' };

const createQueryMock = () => ({
  select: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  or: jest.fn().mockReturnThis(),
  neq: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  maybeSingle: jest.fn(),
  single: jest.fn(),
});

describe('createGroupAction', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('로그인이 없으면 unauthorized를 반환한다', async () => {
    const mockSupabaseClient = {
      auth: { getUser: jest.fn().mockResolvedValue({ data: {}, error: null }) },
      from: jest.fn(),
    };

    (createSupabaseServerClient as jest.Mock).mockReturnValue(
      mockSupabaseClient,
    );

    const result = await createGroupAction('테스트그룹');

    expect(result).toEqual({
      ok: false,
      error: 'unauthorized',
      message: '로그인이 필요합니다.',
    });
  });

  it('그룹을 생성하고 소유자를 멤버로 추가한다', async () => {
    const checkQuery = createQueryMock();
    checkQuery.limit.mockResolvedValue({ data: [], error: null });

    const insertQuery = createQueryMock();
    insertQuery.single.mockResolvedValue({
      data: { group_id: 'group-1', name: '테스트그룹' },
      error: null,
    });

    const memberQuery = {
      insert: jest.fn().mockResolvedValue({ error: null }),
    };

    const mockSupabaseClient = {
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }),
      },
      from: jest
        .fn()
        .mockImplementationOnce(() => checkQuery)
        .mockImplementationOnce(() => insertQuery)
        .mockImplementationOnce(() => memberQuery),
    };

    (createSupabaseServerClient as jest.Mock).mockReturnValue(
      mockSupabaseClient,
    );

    const result = await createGroupAction('테스트그룹');

    expect(result).toEqual({
      ok: true,
      data: { groupId: 'group-1', name: '테스트그룹' },
    });
  });
});

describe('findGroupByNameAction', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('해당 그룹이 없으면 group-not-found를 반환한다', async () => {
    const query = createQueryMock();
    query.limit.mockResolvedValue({ data: [], error: null });

    const mockSupabaseClient = {
      from: jest.fn().mockReturnValue(query),
    };

    (createSupabaseServerClient as jest.Mock).mockReturnValue(
      mockSupabaseClient,
    );

    const result = await findGroupByNameAction('없는그룹');

    expect(result).toEqual({
      ok: false,
      error: 'group-not-found',
      message: '해당 그룹을 찾을 수 없습니다.',
    });
  });
});

describe('joinGroupAction', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('이미 가입된 경우 ok를 반환한다', async () => {
    const groupQuery = createQueryMock();
    groupQuery.maybeSingle.mockResolvedValue({
      data: { group_id: 'group-1' },
      error: null,
    });

    const memberCheckQuery = createQueryMock();
    memberCheckQuery.maybeSingle.mockResolvedValue({
      data: { group_id: 'group-1' },
      error: null,
    });

    const mockSupabaseClient = {
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }),
      },
      from: jest
        .fn()
        .mockImplementationOnce(() => groupQuery)
        .mockImplementationOnce(() => memberCheckQuery),
    };

    (createSupabaseServerClient as jest.Mock).mockReturnValue(
      mockSupabaseClient,
    );

    const result = await joinGroupAction('group-1');

    expect(result).toEqual({ ok: true, data: { groupId: 'group-1' } });
  });
});

describe('searchUsersAction', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('검색어가 짧으면 invalid-format을 반환한다', async () => {
    const result = await searchUsersAction('a');

    expect(result).toEqual({
      ok: false,
      error: 'invalid-format',
      message: '검색어를 2자 이상 입력해주세요.',
    });
  });
});

describe('sendGroupInvitationAction', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('초대자가 멤버가 아니면 forbidden을 반환한다', async () => {
    const membershipQuery = createQueryMock();
    membershipQuery.maybeSingle.mockResolvedValue({
      data: null,
      error: null,
    });

    const mockSupabaseClient = {
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }),
      },
      from: jest.fn().mockReturnValue(membershipQuery),
    };

    (createSupabaseServerClient as jest.Mock).mockReturnValue(
      mockSupabaseClient,
    );

    const result = await sendGroupInvitationAction('group-1', 'user-2');

    expect(result).toEqual({
      ok: false,
      error: 'forbidden',
      message: '그룹 멤버만 초대할 수 있습니다.',
    });
  });
});
