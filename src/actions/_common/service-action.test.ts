import { z } from 'zod';

import {
  createActionErrorState,
  createActionSuccessState,
  createPostgrestErrorState,
  createZodValidationErrorState,
  runServiceAction,
  toActionResult,
} from './service-action';

describe('service-action', () => {
  const consoleErrorSpy = jest
    .spyOn(console, 'error')
    .mockImplementation(() => undefined);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

  it('validation error details를 fieldErrors로 정규화한다', () => {
    const state = createActionErrorState({
      requestId: 'req-1',
      code: 'validation',
      message: '입력값을 확인해 주세요.',
      errorDetails: {
        email: ['이메일 형식이 올바르지 않습니다.'],
      },
    });

    expect(state).toEqual({
      ok: false,
      requestId: 'req-1',
      errorType: 'validation',
      message: '입력값을 확인해 주세요.',
      fieldErrors: {
        email: ['이메일 형식이 올바르지 않습니다.'],
      },
    });
  });

  it('error 값을 직렬화해 상태와 action result에 보존한다', () => {
    const debugError = Object.assign(new Error('db failed'), {
      code: 'XX000',
      status: 500,
      extra: 'ignored',
    });

    const state = createActionErrorState({
      requestId: 'req-error',
      code: 'server',
      message: '실패',
      error: debugError,
    });

    expect(state).toEqual({
      ok: false,
      requestId: 'req-error',
      errorType: 'server',
      message: '실패',
      fieldErrors: undefined,
      error: expect.objectContaining({
        name: 'Error',
        message: 'db failed',
        code: 'XX000',
        status: 500,
      }),
    });

    expect(toActionResult(state)).toEqual({
      ok: false,
      errorType: 'server',
      message: '실패',
      error: expect.objectContaining({
        name: 'Error',
        message: 'db failed',
        code: 'XX000',
        status: 500,
      }),
    });
    expect(state.ok ? undefined : state.error).not.toEqual(
      expect.objectContaining({
        extra: 'ignored',
      }),
    );
  });

  it('zod 검증 에러를 공통 validation 상태로 변환한다', () => {
    const parsed = z
      .object({
        content: z.string().min(1, '댓글을 입력해주세요.'),
      })
      .safeParse({ content: '' });

    expect(parsed.success).toBe(false);
    if (parsed.success) {
      return;
    }

    const state = createZodValidationErrorState({
      requestId: 'req-zod',
      error: parsed.error,
      fallbackMessage: '입력값이 올바르지 않습니다.',
    });

    expect(state.ok).toBe(false);
    if (state.ok) {
      return;
    }

    expect(state.errorType).toBe('validation');
    expect(state.message).toBe('댓글을 입력해주세요.');
    expect(state.fieldErrors).toEqual({
      content: ['댓글을 입력해주세요.'],
    });
    expect(state.error).toEqual({
      issues: expect.arrayContaining([
        expect.objectContaining({
          message: '댓글을 입력해주세요.',
        }),
      ]),
    });
    expect(toActionResult(state)).toEqual({
      ok: false,
      errorType: 'validation',
      message: '댓글을 입력해주세요.',
      fieldErrors: {
        content: ['댓글을 입력해주세요.'],
      },
      error: {
        issues: expect.arrayContaining([
          expect.objectContaining({
            message: '댓글을 입력해주세요.',
          }),
        ]),
      },
    });
  });

  it('postgrest 에러는 서버 로그를 남기고 permission 상태로 변환한다', () => {
    const state = createPostgrestErrorState({
      action: 'comments.insert',
      requestId: 'req-pg',
      error: {
        code: '42501',
        message: 'permission denied',
        details: null,
        hint: null,
      },
      permissionCodes: ['42501'],
      permissionMessage: '댓글 작성 권한이 없습니다.',
      serverMessage: '댓글 작성 중 오류가 발생했습니다.',
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '[action-error]',
      expect.objectContaining({
        action: 'comments.insert',
        requestId: 'req-pg',
        errorType: 'permission',
      }),
    );
    expect(state).toEqual({
      ok: false,
      requestId: 'req-pg',
      errorType: 'permission',
      message: '댓글 작성 권한이 없습니다.',
      fieldErrors: undefined,
      error: {
        code: '42501',
        details: null,
        hint: null,
        message: 'permission denied',
      },
    });
    expect(toActionResult(state)).toEqual({
      ok: false,
      errorType: 'permission',
      message: '댓글 작성 권한이 없습니다.',
      error: {
        code: '42501',
        details: null,
        hint: null,
        message: 'permission denied',
      },
    });
  });

  it('runServiceAction이 예외를 server 상태로 변환한다', async () => {
    const state = await runServiceAction({
      action: 'service-action.test.catch',
      serverErrorMessage: '처리 중 오류가 발생했습니다.',
      run: async () => {
        throw new Error('unexpected');
      },
    });

    expect(state.ok).toBe(false);
    if (state.ok) {
      return;
    }

    expect(state.errorType).toBe('server');
    expect(state.message).toBe('처리 중 오류가 발생했습니다.');
    expect(typeof state.requestId).toBe('string');
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  it('toActionResult는 requestId 없이 클라이언트 결과를 만든다', () => {
    expect(
      toActionResult(
        createActionSuccessState({
          requestId: 'req-success',
          data: { ok: true },
        }),
      ),
    ).toEqual({
      ok: true,
      data: { ok: true },
    });

    expect(
      toActionResult(
        createActionErrorState({
          requestId: 'req-error',
          code: 'server',
          message: '실패',
        }),
      ),
    ).toEqual({
      ok: false,
      errorType: 'server',
      message: '실패',
    });
  });
});
