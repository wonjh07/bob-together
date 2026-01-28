'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

import { LoginButton } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import {
  loginPage,
  loginForm,
  serviceTitle,
  title,
  buttonContainer,
  linkContainer,
} from './page.css';
import { useOnboardingLayout } from '../layout';

import { vars } from '@/styles/theme.css';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { setShowMoveback } = useOnboardingLayout();

  useEffect(() => {
    setShowMoveback(false);
    // 다른 페이지로 이동할 때 기본값(보이기)로 복구하고 싶으면 cleanup 사용
    return () => setShowMoveback(true);
  }, [setShowMoveback]);

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // 로그인 로직 구현
    console.log('Login:', { email, password });
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
      <form className={loginForm} onSubmit={handleLogin}>
        <Input
          type="email"
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <LoginButton href="/dashboard">로그인</LoginButton>
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
