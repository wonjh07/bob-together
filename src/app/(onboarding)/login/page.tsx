'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

import { LoginButton } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { loginAction } from '@/actions/auth';
import {
  loginPage,
  loginForm,
  serviceTitle,
  title,
  buttonContainer,
  linkContainer,
  submitButton,
} from './page.css';
import { loginSchema } from '../utils/schemas';

import type { z } from 'zod';

import { vars } from '@/styles/theme.css';

type LoginInput = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
  });

  const onSubmit = async (data: LoginInput) => {
    try {
      const result = await loginAction(data.email, data.password);

      if (!result.ok) {
        toast.error(result.message || '로그인에 실패했습니다.');
        return;
      }

      toast.success('로그인 성공!');
      router.push('/dashboard');
    } catch (err) {
      toast.error('로그인 중 오류가 발생했습니다.');
      console.error('Login error:', err);
    }
  };

  return (
    <div className={loginPage}>
      <Image
        src="/loginImage.png"
        alt="Login Image"
        loading="eager"
        width={128}
        height={128}
        priority
      />
      <div className={serviceTitle}>밥투게더</div>
      <div className={title}>쉽고 편리한 밥약속 서비스</div>
      <form className={loginForm} onSubmit={handleSubmit(onSubmit)}>
        <Input
          {...register('email')}
          type="email"
          placeholder="이메일"
          disabled={isSubmitting}
          error={errors.email?.message}
        />

        <Input
          {...register('password')}
          type="password"
          placeholder="비밀번호"
          disabled={isSubmitting}
          error={errors.password?.message}
        />

        <button type="submit" disabled={isSubmitting} className={submitButton}>
          {isSubmitting ? '로그인 중...' : '로그인'}
        </button>
        <div className={linkContainer}>
          <Link href="/email-find">이메일 찾기</Link>
          <Link href="/reset-password">비밀번호 재설정</Link>
        </div>
      </form>
      <div className={buttonContainer}>
        <LoginButton href="/signup" bg={vars.color.text}>
          이메일로 가입하기
        </LoginButton>
        <LoginButton bg={vars.color.kakao} color={vars.color.text}>
          카카오로 시작
        </LoginButton>
      </div>
    </div>
  );
}
