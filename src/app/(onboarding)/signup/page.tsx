'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { SubmitButton } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { signupAction } from '@/actions/auth';
import { signupPage, signupForm, title, buttonContainer } from './page.css';
import { useEmailValidation } from '@/hooks/useEmailValidation';
import { useOnboardingLayout } from '../provider/onboarding-provider';
import { signupSchema } from '../utils/schemas';

import type { z } from 'zod';

import { vars } from '@/styles/theme.css';

type SignupInput = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    clearErrors,
    watch,
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    mode: 'onChange',
  });

  const { setShowMoveback } = useOnboardingLayout();
  const email = watch('email');

  const { emailCheckSuccess } = useEmailValidation({
    email,
    errors,
    setError,
    clearErrors,
  });

  useEffect(() => {
    setShowMoveback(true);
    return () => setShowMoveback(false);
  }, [setShowMoveback]);

  const onSubmit = async (data: SignupInput) => {
    const result = await signupAction(data);

    if (!result.ok) {
      setError('root', { message: result.message });
    }
  };

  return (
    <div className={signupPage}>
      <div className={title}>회원가입</div>
      <form className={signupForm} onSubmit={handleSubmit(onSubmit)}>
        <Input
          {...register('email')}
          type="email"
          placeholder="이메일"
          disabled={isSubmitting}
          error={errors.email?.message}
          successMessage={
            emailCheckSuccess ? '사용 가능한 이메일입니다.' : undefined
          }
        />

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

        <Input
          {...register('password')}
          type="password"
          placeholder="비밀번호"
          disabled={isSubmitting}
          error={errors.password?.message}
        />

        <Input
          {...register('passwordConfirm')}
          type="password"
          placeholder="비밀번호 확인"
          disabled={isSubmitting}
          error={errors.passwordConfirm?.message}
        />

        {errors.root && (
          <div style={{ color: vars.color.alert, width: '100%' }}>
            {errors.root.message}
          </div>
        )}

        <SubmitButton
          isLoading={isSubmitting}
          loadingText="가입 중..."
          defaultText="제출"
        />
      </form>
      <div className={buttonContainer}>
        <p>이미 계정이 있으신가요?</p>
        <Link href="/login">로그인</Link>
      </div>
    </div>
  );
}
