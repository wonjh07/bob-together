import { listMyCommentsAction } from './listMine';

describe('listMyCommentsAction', () => {
  it('유효하지 않은 cursor가 들어오면 invalid-format을 반환한다', async () => {
    const result = await listMyCommentsAction({
      cursor: {
        offset: -1,
      },
    });

    expect(result).toEqual({
      ok: false,
      error: 'invalid-format',
      message: '유효한 offset이 아닙니다.',
    });
  });
});
