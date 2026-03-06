import { act, renderHook } from '@testing-library/react';

import { RequestError } from '@/libs/errors/request-error';

import { useRequestError, useSyncRequestError } from './useRequestError';

const mockOpenRequestError = jest.fn();
const mockCloseOwnedRequestError = jest.fn();
const consoleErrorSpy = jest
  .spyOn(console, 'error')
  .mockImplementation(() => undefined);

jest.mock('@/provider/request-error-provider', () => ({
  useRequestErrorContext: () => ({
    openRequestError: mockOpenRequestError,
    closeOwnedRequestError: mockCloseOwnedRequestError,
  }),
}));

type SyncHookProps = {
  active: boolean;
  error: unknown | null;
};

describe('useRequestError', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

  it('에러 객체가 있으면 errorType를 모달에 전달한다', () => {
    const { result } = renderHook(() => useRequestError());

    act(() => {
      result.current.showRequestError({
        errorType: 'conflict',
        message: '이미 존재합니다.',
      });
    });

    expect(mockOpenRequestError).toHaveBeenCalledWith(
      '이미 존재합니다.',
      expect.objectContaining({
        errorType: 'conflict',
        ownerId: expect.any(String),
      }),
    );
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '[request-error] 이미 존재합니다.\n',
      expect.objectContaining({
        errorType: 'conflict',
        message: '이미 존재합니다.',
      }),
    );
  });

  it('RequestError를 전달하면 request-error로 로그한다', () => {
    const { result } = renderHook(() => useRequestError());
    const err = new RequestError({
      ok: false,
      errorType: 'server',
      message: '쿼리 실패',
    });

    act(() => {
      result.current.showRequestError(err);
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '[request-error] 쿼리 실패\n',
      err,
    );
  });

  it('string 메시지는 그대로 모달을 연다', () => {
    const { result } = renderHook(() => useRequestError());

    act(() => {
      result.current.showRequestError('단순 오류');
    });

    expect(mockOpenRequestError).toHaveBeenCalledWith(
      '단순 오류',
      expect.objectContaining({
        errorType: 'server',
        ownerId: expect.any(String),
      }),
    );
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });
});

describe('useSyncRequestError', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('같은 에러를 중복으로 열지 않는다', () => {
    const err = {
      errorType: 'server',
      message: 'fetch failed',
    };
    const initialProps: SyncHookProps = {
      active: true,
      error: err,
    };

    const { rerender } = renderHook(
      (props: SyncHookProps) => {
        useSyncRequestError({
          active: props.active,
          error: props.error,
          fallbackMessage: '요청 실패',
        });
      },
      {
        initialProps,
      },
    );

    rerender(initialProps);

    expect(mockOpenRequestError).toHaveBeenCalledTimes(1);
  });

  it('error 상태가 false가 되면 열린 모달을 닫는다', () => {
    const err = {
      errorType: 'server',
      message: 'fetch failed',
    };
    const initialProps: SyncHookProps = {
      active: true,
      error: err,
    };

    const { rerender } = renderHook(
      (props: SyncHookProps) => {
        useSyncRequestError({
          active: props.active,
          error: props.error,
          fallbackMessage: '요청 실패',
        });
      },
      {
        initialProps,
      },
    );

    rerender({
      active: false,
      error: null,
    });

    expect(mockCloseOwnedRequestError).toHaveBeenCalledWith(expect.any(String));
  });

  it('error 상태가 해제되면 같은 에러를 다시 열 수 있다', () => {
    const err = {
      errorType: 'validation',
      message: '유효한 약속 ID가 아닙니다.',
    };
    const initialProps: SyncHookProps = {
      active: true,
      error: err,
    };

    const { rerender } = renderHook(
      (props: SyncHookProps) => {
        useSyncRequestError({
          active: props.active,
          error: props.error,
          fallbackMessage: '요청 실패',
        });
      },
      {
        initialProps,
      },
    );

    expect(mockOpenRequestError).toHaveBeenCalledTimes(1);

    rerender({
      active: false,
      error: null,
    });

    rerender({
      active: true,
      error: err,
    });

    expect(mockOpenRequestError).toHaveBeenCalledTimes(2);
  });
});
