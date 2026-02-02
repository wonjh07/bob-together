import { searchPlacesAction } from './place';

describe('searchPlacesAction', () => {
  it('검색어가 짧으면 invalid-format을 반환한다', async () => {
    const result = await searchPlacesAction({ query: 'a' });

    expect(result).toEqual({
      ok: false,
      error: 'invalid-format',
      message: '검색어를 2자 이상 입력해주세요.',
    });
  });

  it('위도/경도 중 하나만 전달되면 invalid-format을 반환한다', async () => {
    const result = await searchPlacesAction({
      query: '스타벅스',
      latitude: 37.5,
    });

    expect(result).toEqual({
      ok: false,
      error: 'invalid-format',
      message: '위도와 경도는 함께 전달되어야 합니다.',
    });
  });
});
