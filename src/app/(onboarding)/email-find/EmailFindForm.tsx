'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { findEmailAction } from '@/actions/auth';
import { Input } from '@/components/ui/FormInput';
import { useRequestError } from '@/hooks/useRequestError';
import { emailFindSchema } from '@/schemas/auth';

import * as styles from './page.css';

import type { EmailFindInput } from '@/schemas/auth';

function applyFieldErrors(
  fieldErrors: Record<string, string[]>,
  setError: (
    name: keyof EmailFindInput,
    error: { message: string },
  ) => void,
) {
  const entries = Object.entries(fieldErrors);
  for (const [fieldName, messages] of entries) {
    const message = messages?.[0];
    if (!message) continue;

    if (fieldName === 'name' || fieldName === 'nickname') {
      setError(fieldName, { message });
    }
  }
}

export default function EmailFindForm() {
  const [maskedEmail, setMaskedEmail] = useState<string | null>(null);
  const [notFoundMessage, setNotFoundMessage] = useState<string | null>(null);
  const { showRequestError } = useRequestError();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<EmailFindInput>({
    resolver: zodResolver(emailFindSchema),
    mode: 'onChange',
  });

  const onSubmit = async (data: EmailFindInput) => {
    setMaskedEmail(null);
    setNotFoundMessage(null);

    const result = await findEmailAction(data.name, data.nickname);

    if (!result.ok) {
      if (result.fieldErrors) {
        applyFieldErrors(result.fieldErrors, setError);
        return;
      }

      if (result.errorType === 'not_found') {
        setNotFoundMessage(
          result.message || '일치하는 계정을 찾을 수 없습니다.',
        );
        return;
      }

      showRequestError(result, {
        fallbackMessage: '이메일 조회에 실패했습니다.',
      });
      return;
    }

    if (!result.data?.maskedEmail) {
      showRequestError('이메일 조회 결과를 확인할 수 없습니다.');
      return;
    }

    setMaskedEmail(result.data.maskedEmail);
  };

  return (
    <>
      <form className={styles.emailFindForm} onSubmit={handleSubmit(onSubmit)}>
        <Input
          {...register('name')}
          type="text"
          placeholder="이름"
          disabled={isSubmitting}
          error={errors.name?.message}
        />
        <Input
          {...register('nickname')}
          type="text"
          placeholder="닉네임"
          disabled={isSubmitting}
          error={errors.nickname?.message}
        />

        <button type="submit" disabled={isSubmitting} className={styles.submitButton}>
          {isSubmitting ? '조회 중...' : '이메일 찾기'}
        </button>
      </form>

      {maskedEmail && (
        <div className={styles.resultBox}>
          <div className={styles.resultLabel}>조회된 이메일</div>
          <div className={styles.resultEmail}>{maskedEmail}</div>
        </div>
      )}

      {notFoundMessage && <div className={styles.notFoundText}>{notFoundMessage}</div>}

      <div className={styles.linkContainer}>
        <Link href="/login">로그인으로 돌아가기</Link>
      </div>
    </>
  );
}
