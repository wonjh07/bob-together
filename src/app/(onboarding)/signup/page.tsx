'use client';

import { useEffect, useState } from 'react';

import { LoginButton } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { signupPage, signupForm, title, buttonContainer } from './page.css';
import { useOnboardingLayout } from '../layout';

import Link from 'next/link';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({
    email: '',
    nickname: '',
    password: '',
    confirmPassword: '',
  });
  const { setShowMoveback } = useOnboardingLayout();

  useEffect(() => {
    setShowMoveback(true);
    return () => setShowMoveback(true);
  }, [setShowMoveback]);

  // 이메일 유효성 검사
  const validateEmail = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value) return '';
    if (!emailRegex.test(value)) {
      return '올바른 이메일 형식이 아닙니다.';
    }
    return '';
  };

  // 닉네임 유효성 검사
  const validateNickname = (value: string) => {
    if (!value) return '';
    if (value.length < 2) {
      return '닉네임은 최소 2자 이상이어야 합니다.';
    }
    if (value.length > 20) {
      return '닉네임은 최대 20자까지 입력 가능합니다.';
    }
    return '';
  };

  // 비밀번호 유효성 검사
  const validatePassword = (value: string) => {
    if (!value) return '';
    if (value.length < 8) {
      return '비밀번호는 최소 8자 이상이어야 합니다.';
    }
    if (!/[a-z]/.test(value) || !/[0-9]/.test(value)) {
      return '비밀번호는 영문자와 숫자를 포함해야 합니다.';
    }
    return '';
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    setErrors((prev) => ({
      ...prev,
      email: validateEmail(value),
    }));
  };

  const handleNicknameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNickname(value);
    setErrors((prev) => ({
      ...prev,
      nickname: validateNickname(value),
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    setErrors((prev) => ({
      ...prev,
      password: validatePassword(value),
    }));
  };

  const handleConfirmPasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = e.target.value;
    setConfirmPassword(value);
    if (value && value !== password) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: '비밀번호가 일치하지 않습니다.',
      }));
    } else {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: '',
      }));
    }
  };

  const handleSignup = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (
      errors.email ||
      errors.nickname ||
      errors.password ||
      errors.confirmPassword
    ) {
      alert('입력 항목을 확인해주세요.');
      return;
    }
    // 회원가입 로직 구현
    console.log('Signup:', { email, name, nickname, password });
  };

  return (
    <div className={signupPage}>
      <div className={title}>회원가입</div>
      <form className={signupForm} onSubmit={handleSignup}>
        <Input
          type="email"
          placeholder="이메일"
          value={email}
          onChange={handleEmailChange}
          caption={errors.email}
          required
        />
        <Input
          type="text"
          placeholder="이름"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <Input
          type="text"
          placeholder="닉네임"
          value={nickname}
          onChange={handleNicknameChange}
          caption={errors.nickname}
          required
        />
        <Input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={handlePasswordChange}
          caption={errors.password}
          required
        />
        <Input
          type="password"
          placeholder="비밀번호 확인"
          value={confirmPassword}
          onChange={handleConfirmPasswordChange}
          caption={errors.confirmPassword}
          required
        />
        <LoginButton href="/dashboard">회원가입</LoginButton>
      </form>
      <div className={buttonContainer}>
        <p>이미 계정이 있으신가요?</p>
        <Link href="/login">로그인</Link>
      </div>
    </div>
  );
}
