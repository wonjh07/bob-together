import { createSupabaseServerClient } from '@/libs/supabase/server';

import { createQueryMock, resetAllMocks } from './_testUtils';
import { findGroupByNameAction } from './findGroupByNameAction';

jest.mock('@/libs/supabase/server');

describe('findGroupByNameAction', () => {
  beforeEach(resetAllMocks);

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
