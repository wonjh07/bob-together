'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import toast from 'react-hot-toast';

import { LoginButton } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { loginAction } from './actions';
import {
  loginPage,
  loginForm,
  serviceTitle,
  title,
  buttonContainer,
  linkContainer,
  submitButton,
} from './page.css';

import { vars } from '@/styles/theme.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading) return;

    if (!email.trim() || !password.trim()) {
      toast.error('이메일과 비밀번호를 입력해주세요.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('올바른 이메일 형식이 아닙니다.');
      return;
    }

    setIsLoading(true);

    try {
      const result = await loginAction(email, password);

      if (result && !result.ok) {
        // 타입 안정성을 위한 Record 타입 사용
        const errorMessages: Record<string, string> = {
          'forbidden-origin': '요청이 차단됐습니다. 다시 시도해주세요.',
          'invalid-credentials': '이메일 또는 비밀번호가 올바르지 않습니다.',
          'login-failed': '로그인에 실패했습니다. 잠시 후 다시 시도해주세요.',
          'invalid-email': '이메일 형식이 올바르지 않습니다.',
          'missing-fields': '이메일/비밀번호를 입력해주세요.',
        };

        const message = errorMessages[result.error] || '로그인에 실패했습니다.';
        toast.error(message);
      }
    } catch (err) {
      toast.error('로그인 중 오류가 발생했습니다.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  /*
  // 기존 fetch 기반 로그인 핸들러 (서버 액션으로 대체됨)
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
  */

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
      <form className={loginForm} onSubmit={handleLogin}>
        <Input
          type="email"
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
          required
        />
        <Input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
          required
        />
        <button type="submit" disabled={isLoading} className={submitButton}>
          {isLoading ? '로그인 중...' : '로그인'}
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
