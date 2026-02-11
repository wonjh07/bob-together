import { resetAllMocks } from './_testUtils';
import { searchUsersAction } from './searchUsersAction';

describe('searchUsersAction', () => {
  beforeEach(resetAllMocks);

  it('검색어가 짧으면 invalid-format을 반환한다', async () => {
    const result = await searchUsersAction('a');

    expect(result).toEqual({
      ok: false,
      error: 'invalid-format',
      message: '검색어를 2자 이상 입력해주세요.',
    });
  });
});
