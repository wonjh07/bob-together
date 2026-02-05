'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

import { loginAction } from '@/actions/auth';
import { Input } from '@/components/ui/FormInput';
import { loginSchema } from '@/schemas/auth';

import { loginForm, linkContainer, submitButton } from './page.css';

import type { z } from 'zod';

type LoginInput = z.infer<typeof loginSchema>;

export default function LoginForm() {
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
  );
}
