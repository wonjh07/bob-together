import { renderHook, waitFor } from '@testing-library/react';
import { act } from 'react';

import { checkEmailExists } from '@/actions/validation';

import { useEmailValidation } from './useEmailValidation';

import type { SignupInput } from '@/schemas/auth';
import type {
  FieldErrors,
  UseFormSetError,
  UseFormClearErrors,
} from 'react-hook-form';

jest.mock('@/actions/validation');

describe('useEmailValidation', () => {
  let mockSetError: jest.MockedFunction<UseFormSetError<SignupInput>>;
  let mockClearErrors: jest.MockedFunction<UseFormClearErrors<SignupInput>>;
  const mockCheckEmailExists = checkEmailExists as jest.MockedFunction<
    typeof checkEmailExists
  >;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockSetError = jest.fn();
    mockClearErrors = jest.fn();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('이메일이 없으면 emailCheckSuccess가 false여야 한다', () => {
    const { result } = renderHook(() =>
      useEmailValidation({
        email: undefined,
        errors: {},
        setError: mockSetError,
        clearErrors: mockClearErrors,
      }),
    );

    expect(result.current.emailCheckSuccess).toBe(false);
  });

  it('이메일 에러가 있으면 emailCheckSuccess가 false여야 한다', () => {
    const errors: FieldErrors<SignupInput> = {
      email: { type: 'manual', message: '이메일 형식이 올바르지 않습니다.' },
    };

    const { result } = renderHook(() =>
      useEmailValidation({
        email: 'test@example.com',
        errors,
        setError: mockSetError,
        clearErrors: mockClearErrors,
      }),
    );

    expect(result.current.emailCheckSuccess).toBe(false);
  });

  it('사용 가능한 이메일이면 emailCheckSuccess가 true여야 한다', async () => {
    mockCheckEmailExists.mockResolvedValue({
      ok: true,
      data: { exists: false },
    });

    const { result } = renderHook(() =>
      useEmailValidation({
        email: 'new@example.com',
        errors: {},
        setError: mockSetError,
        clearErrors: mockClearErrors,
      }),
    );

    // 디바운스 대기
    act(() => {
      jest.advanceTimersByTime(500);
    });

    await waitFor(() => {
      expect(result.current.emailCheckSuccess).toBe(true);
    });

    expect(mockClearErrors).toHaveBeenCalledWith('email');
    expect(mockSetError).not.toHaveBeenCalled();
  });

  it('이미 사용 중인 이메일이면 에러를 설정해야 한다', async () => {
    mockCheckEmailExists.mockResolvedValue({
      ok: true,
      data: { exists: true },
    });

    const { result } = renderHook(() =>
      useEmailValidation({
        email: 'existing@example.com',
        errors: {},
        setError: mockSetError,
        clearErrors: mockClearErrors,
      }),
    );

    // 디바운스 대기
    act(() => {
      jest.advanceTimersByTime(500);
    });

    await waitFor(() => {
      expect(mockSetError).toHaveBeenCalledWith('email', {
        type: 'manual',
        message: '이미 사용 중인 이메일입니다.',
      });
    });

    expect(result.current.emailCheckSuccess).toBe(false);
    expect(mockClearErrors).not.toHaveBeenCalled();
  });

  it('이메일 체크 실패 시 에러를 설정해야 한다', async () => {
    mockCheckEmailExists.mockResolvedValue({
      ok: false,
      error: 'check-failed',
      message: 'Failed to check email',
    });

    const { result } = renderHook(() =>
      useEmailValidation({
        email: 'test@example.com',
        errors: {},
        setError: mockSetError,
        clearErrors: mockClearErrors,
      }),
    );

    // 디바운스 대기
    act(() => {
      jest.advanceTimersByTime(500);
    });

    await waitFor(() => {
      expect(mockSetError).toHaveBeenCalledWith('email', {
        type: 'manual',
        message: '이메일 확인 중 오류가 발생했습니다.',
      });
    });

    expect(result.current.emailCheckSuccess).toBe(false);
  });

  it('이메일이 변경되면 디바운스가 다시 시작되어야 한다', async () => {
    mockCheckEmailExists.mockResolvedValue({
      ok: true,
      data: { exists: false },
    });

    const { rerender } = renderHook(
      ({ email }) =>
        useEmailValidation({
          email,
          errors: {},
          setError: mockSetError,
          clearErrors: mockClearErrors,
        }),
      { initialProps: { email: 'test1@example.com' } },
    );

    // 첫 번째 디바운스 진행 중
    act(() => {
      jest.advanceTimersByTime(300);
    });

    // 이메일 변경
    rerender({ email: 'test2@example.com' });

    // 이전 타이머는 취소되고 새로운 타이머가 시작됨
    act(() => {
      jest.advanceTimersByTime(300);
    });

    // 아직 500ms가 지나지 않았으므로 호출되지 않음
    expect(mockCheckEmailExists).not.toHaveBeenCalled();

    // 나머지 200ms 대기
    act(() => {
      jest.advanceTimersByTime(200);
    });

    await waitFor(() => {
      expect(mockCheckEmailExists).toHaveBeenCalledTimes(1);
      expect(mockCheckEmailExists).toHaveBeenCalledWith('test2@example.com');
    });
  });

  it('에러가 발생하면 emailCheckSuccess가 false여야 한다', async () => {
    mockCheckEmailExists.mockRejectedValue(new Error('Network error'));

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    const { result } = renderHook(() =>
      useEmailValidation({
        email: 'test@example.com',
        errors: {},
        setError: mockSetError,
        clearErrors: mockClearErrors,
      }),
    );

    // 디바운스 대기
    act(() => {
      jest.advanceTimersByTime(500);
    });

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Email check error:',
        expect.any(Error),
      );
    });

    expect(result.current.emailCheckSuccess).toBe(false);

    consoleErrorSpy.mockRestore();
  });
});
