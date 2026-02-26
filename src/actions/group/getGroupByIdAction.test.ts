import { createSupabaseServerClient } from '@/libs/supabase/server';

import { getGroupByIdAction } from './getGroupByIdAction';

jest.mock('@/libs/supabase/server');

describe('getGroupByIdAction', () => {
  const maybeSingle = jest.fn();
  const eq = jest.fn(() => ({ maybeSingle }));
  const select = jest.fn(() => ({ eq }));
  const from = jest.fn(() => ({ select }));
  const supabase = { from };

  beforeEach(() => {
    jest.clearAllMocks();
    (createSupabaseServerClient as jest.Mock).mockReturnValue(supabase);
  });

  it('groupId가 없으면 invalid-format을 반환한다', async () => {
    const result = await getGroupByIdAction('');

    expect(result).toEqual({
      ok: false,
      error: 'invalid-format',
      message: '그룹 정보가 필요합니다.',
    });
  });

  it('groupId가 uuid가 아니면 invalid-format을 반환한다', async () => {
    const result = await getGroupByIdAction('invalid-group-id');

    expect(result).toEqual({
      ok: false,
      error: 'invalid-format',
      message: '유효한 그룹 ID가 아닙니다.',
    });
  });

  it('DB 에러면 server-error를 반환한다', async () => {
    maybeSingle.mockResolvedValue({
      data: null,
      error: { message: 'db failed' },
    });

    const result = await getGroupByIdAction('550e8400-e29b-41d4-a716-446655440000');

    expect(result).toEqual({
      ok: false,
      error: 'server-error',
      message: '그룹 정보를 불러오지 못했습니다.',
    });
  });

  it('데이터가 없으면 group-not-found를 반환한다', async () => {
    maybeSingle.mockResolvedValue({
      data: null,
      error: null,
    });

    const result = await getGroupByIdAction('550e8400-e29b-41d4-a716-446655440000');

    expect(result).toEqual({
      ok: false,
      error: 'group-not-found',
      message: '그룹을 찾을 수 없습니다.',
    });
  });

  it('정상 조회 시 그룹 정보를 반환한다', async () => {
    maybeSingle.mockResolvedValue({
      data: {
        group_id: '550e8400-e29b-41d4-a716-446655440000',
        name: '테스트 그룹',
      },
      error: null,
    });

    const result = await getGroupByIdAction('550e8400-e29b-41d4-a716-446655440000');

    expect(result).toEqual({
      ok: true,
      data: {
        groupId: '550e8400-e29b-41d4-a716-446655440000',
        name: '테스트 그룹',
      },
    });
  });
});
