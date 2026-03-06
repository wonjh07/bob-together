import { RequestError } from '@/libs/errors/request-error';

import { logUiError, readUiError } from './action-error';

describe('readUiError', () => {
  it('ActionError shape에서 message와 errorType를 읽는다', () => {
    expect(
      readUiError({
        ok: false,
        errorType: 'permission',
        message: '권한이 없습니다.',
        error: { code: '42501' },
      }),
    ).toEqual({
      errorType: 'permission',
      message: '권한이 없습니다.',
    });
  });

  it('일반 Error에서도 message와 errorType를 읽는다', () => {
    const error = new Error('요청 실패') as Error & { errorType?: string };
    error.errorType = 'server';

    expect(readUiError(error)).toEqual({
      errorType: 'server',
      message: '요청 실패',
    });
  });

  it('string 에러는 기본 errorType을 server로 본다', () => {
    expect(readUiError('단순 오류')).toEqual({
      errorType: 'server',
      message: '단순 오류',
    });
  });

  it('fieldErrors만 있어도 기본 errorType을 validation으로 본다', () => {
    expect(
      readUiError({
        fieldErrors: {
          email: ['이메일 형식이 올바르지 않습니다.'],
        },
      }),
    ).toEqual({
      errorType: 'validation',
      fieldErrors: {
        email: ['이메일 형식이 올바르지 않습니다.'],
      },
      message: undefined,
    });
  });

  it('raw error가 없는 RequestError도 undefined 대신 원본 에러 객체를 로그한다', () => {
    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);

    try {
      const error = new RequestError({
        ok: false,
        errorType: 'server',
        message: '데이터가 없습니다.',
      });

      logUiError({
        err: error,
        fallbackMessage: 'fallback',
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[request-error] 데이터가 없습니다.\n',
        error,
      );
    } finally {
      consoleErrorSpy.mockRestore();
    }
  });

  it('validation RequestError는 nested issues 객체를 콘솔에 로그한다', () => {
    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);

    try {
      const error = new RequestError({
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
      });

      logUiError({
        err: error,
        fallbackMessage: 'fallback',
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[request-error] 유효한 약속 ID가 아닙니다.\n',
        {
          issues: [
            expect.objectContaining({
              message: '유효한 약속 ID가 아닙니다.',
            }),
          ],
        },
      );
    } finally {
      consoleErrorSpy.mockRestore();
    }
  });
});
