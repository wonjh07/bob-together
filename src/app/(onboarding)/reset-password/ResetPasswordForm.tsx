'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

import {
  resetPasswordByIdentityAction,
  verifyResetPasswordIdentityAction,
} from '@/actions/auth';
import { Input } from '@/components/ui/FormInput';
import { useRequestErrorPresenter } from '@/hooks/useRequestErrorPresenter';
import {
  resetPasswordIdentitySchema,
  resetPasswordUpdateSchema,
} from '@/schemas/auth';

import * as styles from './page.css';

import type {
  ResetPasswordIdentityInput,
  ResetPasswordUpdateInput,
} from '@/schemas/auth';

export default function ResetPasswordForm() {
  const router = useRouter();
  const [verifiedIdentity, setVerifiedIdentity] =
    useState<ResetPasswordIdentityInput | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const { openRequestError } = useRequestErrorPresenter();

  const verifyForm = useForm<ResetPasswordIdentityInput>({
    resolver: zodResolver(resetPasswordIdentitySchema),
    mode: 'onChange',
  });

  const updateForm = useForm<ResetPasswordUpdateInput>({
    resolver: zodResolver(resetPasswordUpdateSchema),
    mode: 'onChange',
  });

  const onVerifyIdentity = async (data: ResetPasswordIdentityInput) => {
    setIsVerifying(true);
    const result = await verifyResetPasswordIdentityAction(
      data.email,
      data.name,
    );
    setIsVerifying(false);

    if (!result.ok) {
      if (result.error === 'user-not-found') {
        verifyForm.setError('name', {
          message: result.message || '일치하는 계정을 찾을 수 없습니다.',
        });
        return;
      }

      openRequestError(result.message || '계정 검증에 실패했습니다.', {
        err: result,
        source: 'ResetPasswordForm.onVerifyIdentity.result',
      });
      return;
    }

    verifyForm.clearErrors();
    setVerifiedIdentity(data);
    toast.success('계정 확인이 완료되었습니다.');
  };

  const onResetPassword = async (data: ResetPasswordUpdateInput) => {
    if (!verifiedIdentity) {
      openRequestError('먼저 이메일과 이름을 검증해주세요.', {
        source: 'ResetPasswordForm.onResetPassword.notVerified',
      });
      return;
    }

    const result = await resetPasswordByIdentityAction({
      email: verifiedIdentity.email,
      name: verifiedIdentity.name,
      newPassword: data.newPassword,
      passwordConfirm: data.passwordConfirm,
    });

    if (!result.ok) {
      if (result.error === 'user-not-found') {
        setVerifiedIdentity(null);
        verifyForm.setError('name', {
          message: result.message || '일치하는 계정을 찾을 수 없습니다.',
        });
        return;
      }

      openRequestError(result.message || '비밀번호 재설정에 실패했습니다.', {
        err: result,
        source: 'ResetPasswordForm.onResetPassword.result',
      });
      return;
    }

    toast.success('비밀번호가 재설정되었습니다. 다시 로그인해주세요.');
    router.replace('/login');
  };

  return (
    <>
      {!verifiedIdentity && (
        <form
          className={styles.form}
          onSubmit={verifyForm.handleSubmit(onVerifyIdentity)}>
          <div className={styles.description}>
            이메일과 이름을 먼저 검증한 뒤
            <br />새 비밀번호로 계정을 재설정할 수 있어요.
          </div>
          <Input
            {...verifyForm.register('email')}
            type="email"
            placeholder="이메일"
            disabled={isVerifying}
            error={verifyForm.formState.errors.email?.message}
          />
          <Input
            {...verifyForm.register('name')}
            type="text"
            placeholder="이름"
            disabled={isVerifying}
            error={verifyForm.formState.errors.name?.message}
          />
          <button
            type="submit"
            className={styles.verifyButton}
            disabled={isVerifying}>
            {isVerifying ? '검증 중...' : '확인'}
          </button>
        </form>
      )}

      {verifiedIdentity && (
        <>
          <div className={styles.description}>
            계정이 확인되었습니다. 새 비밀번호를 입력해주세요.
          </div>
          <div className={styles.updateFormWrap}>
            <form
              className={styles.form}
              onSubmit={updateForm.handleSubmit(onResetPassword)}>
              <Input
                {...updateForm.register('newPassword')}
                type="password"
                placeholder="새 비밀번호"
                disabled={updateForm.formState.isSubmitting}
                error={updateForm.formState.errors.newPassword?.message}
              />
              <Input
                {...updateForm.register('passwordConfirm')}
                type="password"
                placeholder="새 비밀번호 확인"
                disabled={updateForm.formState.isSubmitting}
                error={updateForm.formState.errors.passwordConfirm?.message}
              />
              <button
                type="submit"
                className={styles.submitButton}
                disabled={updateForm.formState.isSubmitting}>
                {updateForm.formState.isSubmitting
                  ? '재설정 중...'
                  : '비밀번호 재설정'}
              </button>
            </form>
          </div>
        </>
      )}

      <div className={styles.linkContainer}>
        <Link href="/login">로그인으로 돌아가기</Link>
      </div>
    </>
  );
}
