import { RequestError, runQueryAction, unwrapActionResult } from './request-error';

describe('unwrapActionResult', () => {
  it('성공 결과면 data를 그대로 반환한다', () => {
    expect(
      unwrapActionResult(
        {
          ok: true,
          data: { value: 1 },
        },
        { fallbackMessage: 'fallback' },
      ),
    ).toEqual({ value: 1 });
  });

  it('실패 결과면 RequestError로 변환한다', () => {
    const run = () =>
      unwrapActionResult(
        {
          ok: false,
          errorType: 'permission',
          message: '권한이 없습니다.',
          error: { code: '42501' },
        },
        { fallbackMessage: 'fallback' },
      );

    expect(run).toThrow(RequestError);

    try {
      run();
    } catch (error) {
      const requestError = error as RequestError;
      expect(requestError.message).toBe('권한이 없습니다.');
      expect(requestError.errorType).toBe('permission');
      expect(requestError.error).toEqual({ code: '42501' });
    }
  });

  it('validation 실패도 raw error를 유지한 RequestError로 변환한다', () => {
    const run = () =>
      unwrapActionResult(
        {
          ok: false,
          errorType: 'validation',
          message: '유효한 약속 ID가 아닙니다.',
          error: {
            issues: [
              {
                code: 'invalid_string',
                validation: 'uuid',
                message: '유효한 약속 ID가 아닙니다.',
                path: [],
              },
            ],
          },
        },
        { fallbackMessage: 'fallback' },
      );

    expect(run).toThrow(RequestError);

    try {
      run();
    } catch (error) {
      const requestError = error as RequestError;
      expect(requestError.message).toBe('유효한 약속 ID가 아닙니다.');
      expect(requestError.errorType).toBe('validation');
      expect(requestError.error).toEqual({
        issues: [
          expect.objectContaining({
            message: '유효한 약속 ID가 아닙니다.',
          }),
        ],
      });
    }
  });

  it('성공이지만 data가 비어 있으면 server 코드로 실패 처리한다', () => {
    const run = () =>
      unwrapActionResult(
        {
          ok: true,
        },
        { fallbackMessage: 'fallback', emptyDataMessage: '데이터 없음' },
      );

    expect(run).toThrow(RequestError);

    try {
      run();
    } catch (error) {
      const requestError = error as RequestError;
      expect(requestError.message).toBe('데이터 없음');
      expect(requestError.errorType).toBe('server');
    }
  });
});

describe('runQueryAction', () => {
  it('query action 실행과 unwrap을 한 번에 처리한다', async () => {
    await expect(
      runQueryAction(
        async () => ({
          ok: true,
          data: { value: 1 },
        }),
        { fallbackMessage: 'fallback' },
      ),
    ).resolves.toEqual({ value: 1 });
  });

  it('select로 최종 반환값을 변환할 수 있다', async () => {
    await expect(
      runQueryAction(
        async () => ({
          ok: true,
          data: { groups: [{ groupId: 'g1' }] },
        }),
        {
          fallbackMessage: 'fallback',
          select: (data) => data.groups,
        },
      ),
    ).resolves.toEqual([{ groupId: 'g1' }]);
  });
});
