import { useEffect, useState, useRef } from 'react';

import { checkEmailExists } from '@/actions/validation';

import type { SignupInput } from '@/schemas/auth';
import type {
  UseFormSetError,
  UseFormClearErrors,
  FieldErrors,
} from 'react-hook-form';

interface UseEmailValidationProps {
  email: string | undefined;
  errors: FieldErrors<SignupInput>;
  setError: UseFormSetError<SignupInput>;
  clearErrors: UseFormClearErrors<SignupInput>;
}

interface UseEmailValidationResult {
  emailCheckSuccess: boolean;
}

export function useEmailValidation({
  email,
  errors,
  setError,
  clearErrors,
}: UseEmailValidationProps): UseEmailValidationResult {
  const [emailCheckSuccess, setEmailCheckSuccess] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!email || errors.email) {
      setEmailCheckSuccess(false);
      return;
    }

    // Debounce processing
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      try {
        const result = await checkEmailExists(email);

        if (!result.ok) {
          setError('email', {
            type: 'manual',
            message: '이메일 확인 중 오류가 발생했습니다.',
          });
          setEmailCheckSuccess(false);
          return;
        }

        if (result.data?.exists) {
          setError('email', {
            type: 'manual',
            message: '이미 사용 중인 이메일입니다.',
          });
          setEmailCheckSuccess(false);
        } else {
          clearErrors('email');
          setEmailCheckSuccess(true);
        }
      } catch (error) {
        console.error('Email check error:', error);
        setEmailCheckSuccess(false);
      }
    }, 300);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [email, errors.email, setError, clearErrors]);

  return { emailCheckSuccess };
}
