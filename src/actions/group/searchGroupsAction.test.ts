import { createSupabaseServerClient } from '@/libs/supabase/server';

import { searchGroupsAction } from './searchGroupsAction';

jest.mock('@/libs/supabase/server');

describe('searchGroupsAction', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('검색어가 짧으면 invalid-format을 반환한다', async () => {
    const result = await searchGroupsAction('a');

    expect(result).toEqual({
      ok: false,
      error: 'invalid-format',
      message: '검색어를 2자 이상 입력해주세요.',
    });
  });

  it('조회 실패 시 server-error를 반환한다', async () => {
    const query = {
      select: jest.fn().mockReturnThis(),
      ilike: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue({
        data: null,
        error: { message: 'db failed' },
      }),
    };
    const supabase = {
      from: jest.fn().mockReturnValue(query),
    };
    (createSupabaseServerClient as jest.Mock).mockReturnValue(supabase);

    const result = await searchGroupsAction('점심');

    expect(result).toEqual({
      ok: false,
      error: 'server-error',
      message: '그룹 검색 중 오류가 발생했습니다.',
    });
  });

  it('그룹 검색 결과를 매핑해 반환한다', async () => {
    const query = {
      select: jest.fn().mockReturnThis(),
      ilike: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue({
        data: [
          { group_id: '20000000-0000-4000-8000-000000000101', name: '점심팟' },
          { group_id: '20000000-0000-4000-8000-000000000102', name: '저녁팟' },
        ],
        error: null,
      }),
    };
    const supabase = {
      from: jest.fn().mockReturnValue(query),
    };
    (createSupabaseServerClient as jest.Mock).mockReturnValue(supabase);

    const result = await searchGroupsAction('점심');

    expect(supabase.from).toHaveBeenCalledWith('groups');
    expect(query.select).toHaveBeenCalledWith('group_id, name');
    expect(query.ilike).toHaveBeenCalledWith('name', '%점심%');
    expect(query.order).toHaveBeenCalledWith('name');
    expect(query.limit).toHaveBeenCalledWith(6);
    expect(result).toEqual({
      ok: true,
      data: {
        groups: [
          { groupId: '20000000-0000-4000-8000-000000000101', name: '점심팟' },
          { groupId: '20000000-0000-4000-8000-000000000102', name: '저녁팟' },
        ],
      },
    });
  });
});
